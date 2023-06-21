import express from 'express'
import { python } from 'pythonia'

const { AutoModelForCausalLM } = await python('ctransformers')
const llm = AutoModelForCausalLM.from_pretrained$(
  'TheBloke/WizardCoder-15B-1.0-GGML', {
    model_file: 'WizardCoder-15B-1.0.ggmlv3.q4_0.bin',
    model_type: 'starcoder'
  })

const app = express()
const port = 7860

app.get('/', async (req, res) => {
  const prompt = '<html><head><title>My Favorite Cookie Recipe</title></head><body><div><p>'
  res.write(prompt)
  const raw = await llm(prompt)
  const output = raw.split('</html>')
  res.write(output + '</html>')
  res.end()
})

app.listen(port, () => { console.log(`Open http://localhost:${port}`) })