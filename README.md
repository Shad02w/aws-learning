# AWS Lambda Hello World API with TypeScript

A simple Hello World API implemented using AWS Lambda with TypeScript and Node.js.

## Project Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

## Function Description

The Lambda function returns a simple "Hello, World!" message in JSON format when invoked.

## API Response

When called, the API returns:
```json
{
    "message": "Hello, World!"
}
```

## Deployment Instructions

1. Build the project using `npm run build`
2. Create a new Lambda function in AWS Console
   - Choose Node.js 18.x (or latest LTS) as the runtime
   - Upload the contents of the `dist` folder
3. Configure an API Gateway trigger to expose the Lambda function as an HTTP endpoint

## Testing

You can test the function directly in the AWS Lambda console or through the API Gateway endpoint once configured.
