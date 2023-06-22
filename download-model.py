# a small hack for Pythonia, this allows us to download WizardCoder to it's download directory
# that way it will become readily available to our Node program
from ctransformers import AutoModelForCausalLM
AutoModelForCausalLM.from_pretrained("TheBloke/WizardCoder-15B-1.0-GGML", model_file="WizardCoder-15B-1.0.ggmlv3.q4_0.bin", model_type="starcoder")