import axios from "axios"

const request = async (options: any) => {
  const { url, body, headers, method } = options

  try {
    const response = await axios({ url, method, params: body, headers })
    const { status, msg, message, data } = response.data

    if (status !== "error") {
      return { success: true, response: message ?? msg ?? response.data }
    } else {
      throw message ?? msg
    }
  } catch (error: any) {
    // toast.error(error?.response?.data?.message)
    return { success: false, error: error?.response?.data?.message }
  }
}

const network = {
  request: {
    post: (options: any) => request({ ...options, method: "POST" }),
    get: (options: any) => request({ ...options, method: "GET" }),
    delete: (options: any) => request({ ...options, method: "DELETE" }),
    put: (options: any) => request({ ...options, method: "PUT" }),
    patch: (options: any) => request({ ...options, method: "PATCH" }),
  },
}

export default network
