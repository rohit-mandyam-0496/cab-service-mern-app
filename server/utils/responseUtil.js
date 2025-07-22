class SendResponse {
  errorMsg(req, res, status, message, error) {
    res
      .status(status)
      .json({ success: false, status: status, message: message, error: error });
  }

  successMsg(req, res, status, data, message) {
    const obj = { success: true, status: status, message: message, data: data };
    if (Array.isArray(data)) {
      obj.count = data.length;
    }
    res.status(status).json(obj);
  }

  successMsg2(req, res, status, data, count, message) {
    const obj = { success: true, status: status, message: message, data: data, count: count };
    res.status(status).json(obj);
  }

  idErrorMsg(req, res, status, message) {
    const obj = { success: false, status: status, message: message };
    res.status(status).json(obj);
  }

  customErrMsg(req, res, status, message) {
    res
      .status(status)
      .json({ success: false, status: status, message: message });
  }
}

module.exports = new SendResponse();
