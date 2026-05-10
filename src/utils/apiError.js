
export const ApiError = (
    statusCode,
    message = "Something went wrong",
    error = []
) =>{
    return {
    success: false,
    statusCode,
    message,
    errors,
  };
};