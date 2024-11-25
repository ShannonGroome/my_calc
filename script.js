let displayValue = "";

function appendValue(value) {
  displayValue += value;
  document.getElementById("display").value = displayValue;
}

function clearDisplay() {
  displayValue = "";
  document.getElementById("display").value = displayValue;
}

function compute() {
  try {
    const result = evaluateExpression(displayValue);
    document.getElementById("display").value = result;
    displayValue = result.toString();
  } catch (error) {
    document.getElementById("display").value = "Error";
    displayValue = "";
  }
}

// Convert degrees to radians for trig functions
function degToRad(angle) {
  return (angle * Math.PI) / 180;
}

// Evaluate mathematical expressions
function evaluateExpression(expression) {
  expression = expression
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/π/g, "Math.PI")
    .replace(/e/g, "Math.E");

  const tokens = tokenize(expression);
  const postfix = infixToPostfix(tokens);
  return evaluatePostfix(postfix);
}

// Tokenize the expression into numbers, operators, and parentheses
function tokenize(expression) {
  // Regex to match numbers (with optional negative signs), operators, and functions
  const regex = /(?:\d+\.\d*|\d*\.?\d+)(?:[eE][+-]?\d+)?|[()+\-*/^π]|\b(?:Math\.\w+)\b/g;
  const result = [];
  let match;

  // Handle the expression and extract tokens
  while ((match = regex.exec(expression)) !== null) {
    result.push(match[0]);
  }

  // Handling negative signs correctly (before numbers or functions)
  for (let i = 0; i < result.length; i++) {
    if (result[i] === "-" && (i === 0 || ["+", "-", "*", "/", "^", "("].includes(result[i - 1]))) {
      result[i] = "_NEG_"; // Mark negative signs
    }
  }

  return result;
}

// Convert infix expression to postfix notation
function infixToPostfix(tokens) {
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const output = [];
  const operators = [];

  tokens.forEach((token) => {
    if (!isNaN(token)) {
      output.push(parseFloat(token)); // Numbers go to output
    } else if (token.startsWith("Math.")) {
      operators.push(token); // Functions go to operator stack
    } else if (token === "(") {
      operators.push(token); // Push opening parentheses to stack
    } else if (token === ")") {
      while (operators.length && operators[operators.length - 1] !== "(") {
        output.push(operators.pop()); // Pop until "("
      }
      operators.pop(); // Remove the "("
    } else {
      while (
        operators.length &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop()); // Pop operators of higher or equal precedence
      }
      operators.push(token);
    }
  });

  while (operators.length) {
    output.push(operators.pop()); // Pop remaining operators
  }

  return output;
}

// Evaluate postfix expression
function evaluatePostfix(postfix) {
  const stack = [];

  postfix.forEach((token) => {
    if (token === "_NEG_") {
      // Handle the negative sign by applying it to the next value
      const val = stack.pop();
      stack.push(-val);
    } else if (typeof token === "number") {
      stack.push(token); // Push the number to stack
    } else if (token.startsWith("Math.")) {
      const value = stack.pop();
      const func = Function("return " + token)(); // Get the Math function
      stack.push(func(value));
    } else {
      const b = stack.pop();
      const a = stack.pop();
      switch (token) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          stack.push(a / b);
          break;
        case "^":
          stack.push(Math.pow(a, b));
          break;
        default:
          throw new Error("Unknown operator: " + token);
      }
    }
  });

  return stack.pop();
}
