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
  // "/js/alpinejs@3.12.2.js",
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

const timeoutInSec = 8 * 60
console.log("timeout set to 8 minutes")

app.use(express.static("public"))
 
const maxParallelRequests = 1

const pending: {
  total: number;
  queue: string[];
  aborts: Record<string, any>,
} = {
  total: 0,
  queue: [],
  aborts: {},
}
 
const endRequest = (id: string, reason: string) => {
  if (!id || !pending.queue.includes(id)) {
    return
  }
  
  // politely ask the LLM to stop
  try {
    pending.aborts[id].abort()
  } catch (err) {
    console.log(`could not abort request ${id} (${err})`)
  }
  // remove the request from everywhere
  try {
    pending.queue = pending.queue.filter(i => i !== id)
    delete pending.aborts[id]
    console.log(`cleaned up request ${id}`)
  } catch (err) {
    console.log(`failed to properly clean up request ${id}`)
  }
  console.log(`request ${id} ended (${reason})`)
}

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
    res.write("sorry, max nb of parallel request reached")
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
  pending.aborts[id] = new AbortController() 

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
${alpine}
# Guidelines
- You use Tailwind CSS and DaisyUI!
- You MUST use English, not Latin! (I repeat: do NOT write lorem ipsum!)
- Use a central layout by wrapping everything in a \`<div class="flex flex-col justify-center">\`
# Result output
${prefix}`

      
  try {
    const inputTokens = await llm.tokenize(finalPrompt)
    console.log("initializing the generator (may take 30s or more)")
    const generator = await llm.generate(inputTokens)
    for await (const token of generator) {
      const tmp = await llm.detokenize(token)
      process.stdout.write(tmp)
      res.write(tmp)
    }

    endRequest(id, `normal end of the llama stream for request ${id}`)
  } catch (e) {
    endRequest(id, `premature end of the llama stream for request ${id} (${e})`)
  } 

  try {
    res.end()
  } catch (err) {
    console.log(`couldn't end the HTTP stream for request ${id} (${err})`)
  }
  
})

app.listen(port, () => { console.log(`Open http://localhost:${port}/?prompt=a%20landing%20page%20for%20a%20company%20called%20Hugging%20Face`) })

