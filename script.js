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


function degToRad(angle) {
  return (angle * Math.PI) / 180;
}


function evaluateExpression(expression) {
  const tokens = tokenize(expression);
  const postfix = infixToPostfix(tokens);
  return evaluatePostfix(postfix);
}

// Tokenize the expression into numbers, operators, and functions
function tokenize(expression) {
  const regex = /(?:\d+\.\d*|\d*\.?\d+)(?:[eE][+-]?\d+)?|π|e|[()+\-*/^]|sin|cos|tan|deg/g;
  const tokens = [];
  let match;

  while ((match = regex.exec(expression)) !== null) {
    let token = match[0];

    // Replace constants π and e
    if (token === "π") {
      token = Math.PI.toString();
    } else if (token === "e") {
      token = Math.E.toString();
    }

    tokens.push(token);
  }

  // Handle unary minus (negative numbers)
  for (let i = 0; i < tokens.length; i++) {
    if (
      tokens[i] === "-" &&
      (i === 0 || ["+", "-", "*", "/", "^", "("].includes(tokens[i - 1]))
    ) {
      // Merge "-" with the next number or constant
      tokens[i + 1] = `-${tokens[i + 1]}`;
      tokens.splice(i, 1); // Remove the "-"
    }
  }

  return tokens;
}

// Convert infix expression to postfix notation
function infixToPostfix(tokens) {
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const output = [];
  const operators = [];

  tokens.forEach((token) => {
    if (!isNaN(token)) {
      // Push numbers to output
      output.push(parseFloat(token));
    } else if (["sin", "cos", "tan", "deg"].includes(token)) {
      // Push functions to the operator stack
      operators.push(token);
    } else if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      while (operators.length && operators[operators.length - 1] !== "(") {
        output.push(operators.pop());
      }
      operators.pop(); // Remove the "("
    } else {
      while (
        operators.length &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop());
      }
      operators.push(token);
    }
  });

  while (operators.length) {
    output.push(operators.pop());
  }

  return output;
}

function evaluatePostfix(postfix) {
  const stack = [];

  postfix.forEach((token) => {
    if (!isNaN(token)) {
      // Push numbers to stack
      stack.push(parseFloat(token));
    } else if (["sin", "cos", "tan"].includes(token)) {

      const value = stack.pop();
      if (token === "sin") stack.push(Math.sin(value));
      if (token === "cos") stack.push(Math.cos(value));
      if (token === "tan") stack.push(Math.tan(value));

    } else if (token === "deg") {

      const radians = stack.pop();
      stack.push((radians * 180) / Math.PI);
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
