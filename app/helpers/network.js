import axios from "axios"

const request = async (options) => {
  const { url, body, headers, method } = options

  try {
    const response = await axios({ url, method, params: body, headers })
    const { status, msg, message, data } = response.data

    if (status !== "error") {
      return { success: true, response: message ?? msg ?? response.data }
    } else {
      throw message ?? msg
    }
  } catch (error) {
    // toast.error(error?.response?.data?.message)
    return { success: false, error: error?.response?.data?.message }
  }
}

export const network = {
  request: {
    post: (options) => request({ ...options, method: "POST" }),
    get: (options) => request({ ...options, method: "GET" }),
    delete: (options) => request({ ...options, method: "DELETE" }),
    put: (options) => request({ ...options, method: "PUT" }),
    patch: (options) => request({ ...options, method: "PATCH" }),
  },
}