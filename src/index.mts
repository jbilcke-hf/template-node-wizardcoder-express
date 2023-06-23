import express from "express"
import { python } from 'pythonia'

import { daisy } from "./daisy.mts"
import { alpine } from "./alpine.mts"

// import Python dependencies
const { AutoModelForCausalLM } = await python('ctransformers')

// define the CSS and JS dependencies
const css = [
  "/css/daisyui@2.6.0.css",
].map(item => `<link href="${item}" rel="stylesheet" type="text/css"/>`)
.join("")

const script = [
  "/js/alpinejs@3.12.2.js",
  "/js/tailwindcss@3.3.2.js"
].map(item => `<script src="${item}"></script>`)
.join("")

// import the language model (note: need a fast internet link)
const llm = await AutoModelForCausalLM.from_pretrained$(
  "TheBloke/WizardCoder-15B-1.0-GGML", {
    model_file: "WizardCoder-15B-1.0.ggmlv3.q4_0.bin",
    model_type: "starcoder"
  })

const app = express()
const port = 7860

const timeoutInSec = 60 * 60

console.log("timeout set to 60 minutes")

app.use(express.static("public"))
 
const maxParallelRequests = 1

const pending: {
  total: number;
  queue: string[];
} = {
  total: 0,
  queue: [],
}
 
const endRequest = (id: string, reason: string) => {
  if (!id || !pending.queue.includes(id)) {
    return
  }
  
  pending.queue = pending.queue.filter(i => i !== id)
  console.log(`request ${id} ended (${reason})`)
}

// we need to exit the open Python process or else it will keep running in the background
process.on('SIGINT', () => {
  try {
    (python as any).exit()
  } catch (err) {
    // exiting Pythonia can get a bit messy: try/catch or not,
    // you *will* see warnings and tracebacks in the console
  }
  process.exit(0)
})

app.get("/debug", (req, res) => {
  res.write(JSON.stringify({
    nbTotal: pending.total,
    nbPending: pending.queue.length,
    queue: pending.queue,
  }))
  res.end()
})

app.get("/", async (req, res) => {
  // naive implementation: we say we are out of capacity
  if (pending.queue.length >= maxParallelRequests) {
    res.write("sorry, max nb of parallel requests reached")
    res.end()
    return
  }
  // alternative approach: kill old queries
  // while (pending.queue.length > maxParallelRequests) {
  //   endRequest(pending.queue[0], 'max nb of parallel request reached')
  // }

  const id = `${pending.total++}`
  console.log(`new request ${id}`)

  pending.queue.push(id)

  const prefix = `<html><head>${css}${script}`
  res.write(prefix)

  req.on("close", function() {
    endRequest(id, "browser ended the connection")
  })

  // for testing we kill after some delay
  setTimeout(() => {
    endRequest(id, `timed out after ${timeoutInSec}s`)
  }, timeoutInSec * 1000)


  const finalPrompt = `# Context
Generate a webpage written in English about: ${req.query.prompt}.
# Documentation
${daisy}
# Guidelines
- Do not write a tutorial or repeat the instruction, but directly write the final code within a script tag
- Use a color scheme consistent with the brief and theme
- You need to use Tailwind CSS and DaisyUI for the UI, pure vanilla JS and AlpineJS for the JS.
- You vanilla JS code will be written directly inside the page, using <script type="text/javascript">...</script>
- You MUST use English, not Latin! (I repeat: do NOT write lorem ipsum!)
- No need to write code comments, and try to make the code compact (short function names etc)
- Use a central layout by wrapping everything in a \`<div class="flex flex-col justify-center">\`
# Result output
${prefix}`

      
  try {
    // be careful: if you input a prompt which is too large, you may experience a timeout
    const inputTokens = await llm.tokenize(finalPrompt)
    console.log("initializing the generator (may take 30s or more)")
    const generator = await llm.generate(inputTokens)
    console.log("generator initialized, beginning token streaming..")
    for await (const token of generator) {
      if (!pending.queue.includes(id)) {
        break
      }
      const tmp = await llm.detokenize(token)
      process.stdout.write(tmp)
      res.write(tmp)
    }

    endRequest(id, `normal end of the LLM stream for request ${id}`)
  } catch (e) {
    endRequest(id, `premature end of the LLM stream for request ${id} (${e})`)
  } 

  try {
    res.end()
  } catch (err) {
    console.log(`couldn't end the HTTP stream for request ${id} (${err})`)
  }
  
})

app.listen(port, () => { console.log(`Open http://localhost:${port}/?prompt=a%20landing%20page%20for%20a%20company%20called%20Hugging%20Face`) })

