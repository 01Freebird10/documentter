class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(true, message, data));
  }

  static error(res, message = 'Error', statusCode = 500) {
    return res.status(statusCode).json(new ApiResponse(false, message, null));
  }
}

export default ApiResponse;
