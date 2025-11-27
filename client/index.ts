import { wrapFetchWithPayment, decodeXPaymentResponse } from 'x402-fetch'

const fetchConfig = {

}

const accountConfig = {

}

const fetchWithPayment = wrapFetchWithPayment(fetchConfig, accountConfig)

const response = await fetchWithPayment('http://localhost:3000/super-secret-knowledge', {
    method: 'GET',
})

const paymentResponse = decodeXPaymentResponse(response.headers.get('x-payment-response')!)

console.log(paymentResponse)
