import os
import sqlite3
import json

script_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(script_directory)
json_file_path = os.path.join(parent_directory, 'tmp', 'specs.js')
db_file_path = os.path.join(script_directory, 'specs.db')

# Load JSON data from the file
with open(json_file_path, 'r') as file:
  json_data = json.load(file)

# Establish a connection to the SQLite database
conn = sqlite3.connect(db_file_path)
cursor = conn.cursor()

# Create a table to store the CPU specifications
cursor.execute('''
  CREATE TABLE IF NOT EXISTS cpu_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpu_name TEXT,
    manufacturer TEXT,
    architecture TEXT,
    market TEXT,
    lithography TEXT,
    tdp TEXT,
    core_count INTEGER,
    thread_count INTEGER,
    max_memory_channels INTEGER,
    max_memory_frequency TEXT,
    memory_type TEXT,
    base_frequency TEXT,
    boost_frequency TEXT,
    l2_cache_total TEXT,
    release_date TEXT,
    socket TEXT,
    aes INTEGER,
    avx_sse_mmx TEXT,
    geekbench_single_core_score INTEGER,
    geekbench_multi_core_score INTEGER,
    userbenchmark_cpu_score TEXT
  )
''')

# Insert CPU data into the database
for cpu_name, cpu_data in json_data.items():
  if cpu_data.get('type') == 'CPU':
    data = cpu_data['data']
    cursor.execute('''
      INSERT INTO cpu_specs (
        cpu_name, manufacturer, architecture, market, lithography, tdp, core_count, thread_count,
        max_memory_channels, max_memory_frequency, memory_type, base_frequency, boost_frequency,
        l2_cache_total, release_date, socket, aes, avx_sse_mmx, geekbench_single_core_score,
        geekbench_multi_core_score, userbenchmark_cpu_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
      cpu_name, data.get('Manufacturer'), data.get('Architecture'), data.get('Market'), data.get('Lithography'),
      data.get('TDP'), data.get('Core Count'), data.get('Thread Count'), data.get('Max Memory Channels'),
      data.get('Max Memory Frequency'), data.get('Memory Type'), data.get('Base Frequency'),
      data.get('Boost Frequency'), data.get('L2 Cache (Total)'), data.get('Release Date'), data.get('Socket'),
      int(data.get('AES', False)), data.get('AVX/SSE/MMX'), data.get('Geekbench Single-Core Score'),
      data.get('Geekbench Multi-Core Score'), data.get('UserBenchmark CPU Score')
    ))

# Commit the changes and close the connection
conn.commit()
conn.close()
