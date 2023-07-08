import os
import json
import yaml

def format_string(input_string):
  # Remove whitespace and hyphens
  formatted_string = input_string.replace(" ", "-")
  
  # Convert to lowercase
  formatted_string = formatted_string.lower()
  
  return formatted_string


script_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(script_directory)
folder_path = os.path.join(parent_directory, 'specs', 'MISSINGCPUS')
specs_path = os.path.join(parent_directory, 'specs')
json_file_path = os.path.join(script_directory, 'specs.js')
json_geekbench_path = os.path.join(script_directory, 'geekbench-parse.json')

listOfCPUs = []
# Load JSON data from the file
with open(json_file_path, 'r') as file:
  json_data = json.load(file)

with open(json_geekbench_path, 'r') as file:
  json_geekbench_data = json.load(file)

for cpu_name, cpu_data in json_data.items():
  if cpu_data.get('type') == 'CPU':
    listOfCPUs.append(format_string(cpu_name))

cpu_names = [format_string(item['combineMetadata']['matcherInfo']['name'].strip().replace('Intel ','').replace('AMD ','')) for item in json_geekbench_data]
for item in cpu_names:
  if "core" not in item:
    cpu_names.remove(item)

missingcpus = []
# Print the CPU names
for cpu_name in cpu_names:
  if(cpu_name not in listOfCPUs):
    missingcpus.append(cpu_name)

def create_yaml_files(missingcpus):
  # Create the folder if it doesn't exist
  if not os.path.exists(folder_path):
    os.makedirs(folder_path)
  
  # Generate the file path
  file_path1 = os.path.join(specs_path, f'MISSINGCPUS.yaml')

  # Write the YAML data to the file
  with open(file_path1, 'w') as file:
    yaml.dump(missingcpus, file)

  # Create a YAML file for each string in the list
  for cpu_name in missingcpus:
    data = {'name': cpu_name,'humanName':cpu_name.replace("-"," ")}

    # Generate the file path
    file_path = os.path.join(folder_path, f'{cpu_name}.yaml')
    
    # Write the YAML data to the file
    with open(file_path, 'w') as file:
      yaml.dump(data, file)


create_yaml_files(missingcpus)
