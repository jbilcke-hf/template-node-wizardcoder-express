---
title: Template Node WizardCoder Express
emoji: 🧙
colorFrom: yellow
colorTo: green
sdk: docker
pinned: false
app_port: 7860
---

A minimalist Docker space to help people getting started with Node, WizardCoder (through CTransformers and Pythonia), Express and TypeScript.
Ready to be used in a Hugging Face Space.

## Installation

### Prerequisites

- Install NVM: https://github.com/nvm-sh/nvm
- Install Docker https://www.docker.com

### CTransformers

This project relies on CTransformers called through Pythonia.

To install ctransformers:

```bash
pip install ctransformers
# or this, depending on your Python environment:
# pip3 install ctransformers
```

For GPU (CUDA) support set environment variable CT_CUBLAS=1 and install from source using:

```bash
CT_CUBLAS=1 pip install ctransformers --no-binary ctransformers
# or this, depending on your Python environment:
# CT_CUBLAS=1 pip3 install ctransformers --no-binary ctransformers
```

### Building and run without Docker

```bash
nvm use
npm i
npm run start
```

### Building and running with Docker

```bash
npm run docker
```

This script is a shortcut executing the following commands:

```bash
docker build -t template-node-wizardcoder-express .
docker run -it -p 7860:7860 template-node-wizardcoder-express
```

Attention! If you have a Mac, you may have trouble running the project on your machine.

You will see the following error message because Docker won't be able to use the pre-generated binaries for `libctransformers.so` due to architecture incompatibility:

```
🌉 OSError: /home/user/.local/lib/python3.11/site-packages/ctransformers/lib/avx2/libctransformers.so: cannot open shared object file: No such file or directory]
```

However if you run your project on a Hugging Face space, you should be just fine :)

See this demo: https://huggingface.co/spaces/jbilcke-hf/template-node-ctransformers-express
