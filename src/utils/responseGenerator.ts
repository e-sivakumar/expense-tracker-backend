export function generateResponse(displayMessage:string, statusCode: number, status: string, data = {} ) {
    return {
        displayMessage,
        statusCode,
        status,
        ...(data && {data})
    }
}

export function invalidArgumentsResponse(){
    return generateResponse("Invalid arguments", 400, "failed");
}

export function internalServerErrorResponse(){
    return generateResponse("Server error, try again later", 500, "failed");
}

