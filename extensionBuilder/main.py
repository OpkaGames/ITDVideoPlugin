from zipfile import ZipFile
import os

current_dir = os.getcwd()

with ZipFile("build/ITDVideoPlugin.zip", "w") as myzip:
    myzip.write(f"{current_dir}/scripts/background.js", "scripts/background.js")
    myzip.write(f"{current_dir}/scripts/content.js", "scripts/content.js")
    myzip.write(f"{current_dir}/manifest.json", "manifest.json")