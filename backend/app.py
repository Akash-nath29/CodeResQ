from fastapi import FastAPI
from pydantic import BaseModel
import ollama
import json

app = FastAPI()

class CodeRequest(BaseModel):
    code: str

@app.post("/analyze")
async def analyze_code(request: CodeRequest):
    prompt = f"""
You are an experienced cybersecurity analyst. Analyze the provided code specifically for severe security vulnerabilities. Only identify vulnerabilities that pose real-world threats, such as:

- SQL Injection
- Command Injection
- Hardcoded sensitive information (passwords or credentials)
- Authentication/Authorization issues

Provide output strictly in the following JSON format, reporting only real, actionable security vulnerabilities:

{{
    "vulnerabilities": [
        {{
            "line": line_number,
            "severity": "high/medium/low",
            "type": "vulnerability",
            "description": "specific, actionable description of the security issue"
        }}
    ]
}}

Important guidelines:
- Do NOT include minor code-quality issues, typos, or non-critical problems.
- Prioritize accuracy and relevance. If unsure about a vulnerability, omit it.
- Focus only on clear, severe security vulnerabilities.
- If no severe security vulnerabilities exist, respond exactly with: {{"vulnerabilities": []}}

Here is the code for analysis:

{request.code}
"""

    response = ollama.generate(
        model='llama3.1:8b',
        prompt=prompt,
        format='json'
    )

    try:
        vulnerabilities = json.loads(response['response'])
    except json.JSONDecodeError:
        vulnerabilities = {"vulnerabilities": []}

    return vulnerabilities


@app.post("/complexity")
async def calculate_complexity(request: CodeRequest):
    prompt = f"""
Analyze the provided code snippet for complexity strictly using the following rules:

Lines of Code (LOC):
- < 100 lines: Low Complexity
- 100–500 lines: Medium Complexity
- > 500 lines: High Complexity

Maintainability (Code Smells):
- A (0–5%): Very Low Technical Debt
- B (6–10%): Low Technical Debt
- C (11–20%): Moderate Technical Debt
- D (21–50%): High Technical Debt
- E (>50%): Very High Technical Debt

Cyclomatic Complexity, Cognitive Complexity, NPath Complexity rules:
- If/Else Condition: +1 Cyclomatic, +1 Cognitive, doubles NPath
- For/While/Do-While Loop: +1 Cyclomatic, +1 Cognitive, multiplies NPath
- Switch Case: +1 Cyclomatic per case, +1 Cognitive, adds NPath
- Ternary Operator: +1 Cyclomatic, +1 Cognitive, doubles NPath
- Recursion: +1 Cyclomatic, +1 Cognitive, high NPath
- Lambda/Closure: +1 Cyclomatic, +1 Cognitive

Provide output strictly in the following JSON format:
{{
    "summary": {{
        "lines_of_code": "Low/Medium/High",
        "maintainability": "A/B/C/D/E",
        "cyclomatic_complexity": integer,
        "cognitive_complexity": integer,
        "npath_complexity": "Low/Medium/High"
    }}
}}

Here is the code snippet:
{request.code}
"""

    response = ollama.generate(
        model='llama3.1:8b',
        prompt=prompt,
        format='json'
    )

    try:
        complexity_summary = json.loads(response['response'])
    except json.JSONDecodeError:
        complexity_summary = {"summary": {}}

    return complexity_summary


@app.post("/refactor")
async def refactor_code(request: CodeRequest):
    prompt = f"""
You are an expert developer. Your task is to refactor the following code snippet to achieve the lowest complexity, strictly following these rules:

- Minimize Cyclomatic, Cognitive, and NPath complexities.
- Remove any duplication of logic.
- Optimize code maintainability and readability.
- Preserve the exact original functionality.
- Ensure the refactored code is fully functional and syntactically correct.

Important:
- Provide only the complete, functional, and self-contained refactored code.
- Do NOT include explanations, additional markdown, or redundant code blocks.

Refactor this code:

{request.code}
"""

    response = ollama.generate(model='llama3.1:8b', prompt=prompt)
    optimized_code = response['response'].strip()

    # Clean the response to ensure it contains no redundant markdown or extra code blocks
    if optimized_code.startswith("```python"):
        optimized_code = optimized_code[len("```python"):].strip()
    if optimized_code.endswith("```"):
        optimized_code = optimized_code[:-3].strip()

    return {"optimized_code": optimized_code}

