require('dotenv').config({ path: './.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            tools: [{
                functionDeclarations: [
                    {
                        name: "trigger_checkout",
                        description: "Kích hoạt form thanh toán (checkout) hoặc thêm vào giỏ hàng cho khách hàng trên giao diện.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                product_id: {
                                    type: "STRING",
                                    description: "ID của sản phẩm mà khách hàng muốn mua"
                                },
                                quantity: {
                                    type: "INTEGER",
                                    description: "Số lượng sản phẩm khách hàng muốn mua"
                                }
                            },
                            required: ["product_id", "quantity"]
                        }
                    }
                ]
            }]
        });

        const result = await model.generateContent("hello");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
