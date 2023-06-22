import express from 'express'
import { python } from 'pythonia'

const { AutoModelForCausalLM } = await python('ctransformers')
const llm = await AutoModelForCausalLM.from_pretrained$(
  'TheBloke/WizardCoder-15B-1.0-GGML', {
    model_file: 'WizardCoder-15B-1.0.ggmlv3.q4_0.bin',
    model_type: 'starcoder'
  })

const app = express()
const port = 7860

app.get('/', async (req, res) => {
  const prefix = `<html><head>`
  const prompt = `# Context
A website about a delicious chocolate chip cookie recipe!
# Output
${prefix}`
  res.write(prefix)
  console.log('calling llm')
  const raw = await llm(prompt)
  console.log('raw:', raw)
  const output = raw.split('</html>')
  res.write(output + '</html>')
  res.end()
})

app.listen(port, () => { console.log(`Open http://localhost:${port}`) })