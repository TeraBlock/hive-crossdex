import {network} from "../helpers/network"
import { apiUrls } from "../configs/config"

const getQuoteAmount = async (body: any) => {
  try {
    return network.request.get({ url: `${apiUrls.swidgeApi}/${body.chainId}/quote/`, body })
  } catch (e: any) {
    console.error(`Error in quote api`, e.message)
  }
}

const getSwapData = (body: any) => {
  return network.request.get({ url: `${apiUrls.swidgeApi}/${body.chainId}/swap?disableEstimate=true&slippage=1`, body })
}

const status = async (body: any) => {
  return await network.request.get({ url: `${apiUrls.bridgeApi}/status`, body })
}

const getBridgeCommission = async (body: any) => {
  return await network.request.get({
    url: `${apiUrls.bridgeApi}/api/getcommission`,
    body,
  })
}

const verifyPlayerName = async (body: any) => {
  try {
    let res = await network.request.get({ url: `${apiUrls.bridgeApi}/exists`, body })
    return res;
  } catch (e: any) {
    console.error(`Error in player name api ${e.message}`)
  }
}

const api = { getQuoteAmount, getSwapData, status, getBridgeCommission, verifyPlayerName }

export default api
