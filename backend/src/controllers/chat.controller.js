const axios = require('axios');
const Product = require('../models/product.model');
const ChatLog = require('../models/chatLog.model');

// Hàm tạo RAG Context từ Database
const getProductContext = async () => {
    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'price', 'discountPrice', 'stock', 'description']
        });
        
        let context = "DỮ LIỆU SẢN PHẨM TRONG KHO (Chỉ giới thiệu các sản phẩm có trong danh sách này):\n";
        products.forEach(p => {
            const currentPrice = p.discountPrice ? p.discountPrice : p.price;
            const discountInfo = p.discountPrice ? ` [ĐANG GIẢM GIÁ từ ${Number(p.price).toLocaleString()} VNĐ xuống ${Number(currentPrice).toLocaleString()} VNĐ]` : '';
            const desc = p.description ? p.description.substring(0, 100) + '...' : 'Không có';
            context += `- ID: ${p.id} | Tên: ${p.name} | Giá hiện tại: ${Number(currentPrice).toLocaleString()} VNĐ${discountInfo} | Tồn kho: ${p.stock} | Mô tả: ${desc}\n`;
        });
        return context;
    } catch (error) {
        console.error("Lỗi lấy RAG context:", error);
        return "Dữ liệu sản phẩm hiện không khả dụng.";
    }
};

const SYSTEM_INSTRUCTION = `Bạn là một Chuyên gia Tư vấn Nội thất Cao cấp và Trợ lý Chăm sóc Khách hàng làm việc cho cửa hàng nội thất Luxe Furnish. Thái độ của bạn luôn chuyên nghiệp, lịch sự, thấu hiểu và hướng tới việc chốt sale một cách tinh tế.

Luật cốt lõi:
1. Khi khách hàng hỏi mua hoặc tìm kiếm sản phẩm, HÃY LUÔN dựa vào [Dữ liệu sản phẩm] được cung cấp để trả lời. Tuyệt đối KHÔNG bịa đặt sản phẩm hoặc giá cả không có trong kho. Đặc biệt chú ý các sản phẩm có nhãn [ĐANG GIẢM GIÁ] để ưu tiên giới thiệu cho khách hàng nhằm tăng tỷ lệ chốt sale.
2. Luôn chủ động khai thác nhu cầu thực tế: Hỏi về diện tích phòng, phong cách yêu thích, hoặc màu sơn tường trước khi đưa ra gợi ý cuối cùng.
3. Cấu trúc trả lời: Đưa ra 1-2 lựa chọn tốt nhất. ĐỂ GẮN SẢN PHẨM VÀO TIN NHẮN, BẠN BẮT BUỘC PHẢI DÙNG CÚ PHÁP: [PRODUCT:id_sản_phẩm]. Ví dụ: "Dạ em thấy mẫu Sofa này rất hợp: [PRODUCT:5]". Không tự bịa ID, chỉ dùng ID từ Dữ liệu sản phẩm!
4. Khi nhận diện khách hàng có ý định mua (Ví dụ: "Tôi lấy cái này", "Cho mình đặt cái sofa đỏ", "Mua thế nào?"), bạn HÃY chủ động xác nhận lại thông tin sản phẩm và số lượng. ĐỒNG THỜI, BẮT BUỘC phải gọi function trigger_checkout với ID sản phẩm để mở form.
5. Khi khách hàng dùng từ ngữ bức xúc, bực tức, hoặc các từ khóa như "hỏng", "lỗi", "giao sai", "thái độ kém", bạn phải LẬP TỨC chuyển sang trạng thái xoa dịu. Gửi lời xin lỗi chân thành, lịch sự và hứa hẹn xử lý ngay. ĐỒNG THỜI, gọi function create_support_ticket để báo động cho Admin.
6. KHÔNG BAO GIỜ sử dụng định dạng bảng (Markdown tables). Trả lời ngắn gọn, súc tích (dưới 150 từ), chia thành các đoạn văn nhỏ để dễ đọc.
7. Không trả lời các câu hỏi về lập trình, toán học, hoặc kiến thức ngoài lề không liên quan đến nội thất.
8. TUYỆT ĐỐI KHÔNG VIẾT SAI CHÍNH TẢ. Phải sử dụng tiếng Việt chuẩn, dấu câu rõ ràng, văn phong chuyên nghiệp và trau chuốt. Nếu không chắc chắn về từ ngữ, hãy chọn cách diễn đạt đơn giản, lịch sự nhất.`;

// Định nghĩa tools theo chuẩn OpenAI (OpenRouter tương thích)
const TOOLS = [
    {
        type: "function",
        function: {
            name: "trigger_checkout",
            description: "Kích hoạt form thanh toán (checkout) hoặc thêm vào giỏ hàng cho khách hàng trên giao diện.",
            parameters: {
                type: "object",
                properties: {
                    product_id: {
                        type: "string",
                        description: "ID của sản phẩm mà khách hàng muốn mua"
                    },
                    quantity: {
                        type: "integer",
                        description: "Số lượng sản phẩm khách hàng muốn mua"
                    }
                },
                required: ["product_id", "quantity"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_support_ticket",
            description: "Ghi nhận khiếu nại, phản ánh hoặc yêu cầu bảo hành của khách hàng vào hệ thống để Admin xử lý.",
            parameters: {
                type: "object",
                properties: {
                    issue_description: {
                        type: "string",
                        description: "Tóm tắt chi tiết vấn đề khách hàng đang gặp phải"
                    }
                },
                required: ["issue_description"]
            }
        }
    }
];

exports.handleChat = async (req, res) => {
    try {
        const { message, history, sessionId, userId, adminMode } = req.body;
        
        // Log tin nhắn của người dùng
        if (sessionId) {
            const finalRole = adminMode ? 'user_support' : 'user';
            await ChatLog.create({ sessionId, userId: userId || null, role: finalRole, message });
        }

        // CHẾ ĐỘ NHÂN VIÊN: Không gọi AI, chỉ lưu tin nhắn vào database
        if (adminMode) {
            return res.status(200).json({ reply: null, action: null, recommendedProducts: [] });
        }
        
        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({ message: "Vui lòng thiết lập OPENROUTER_API_KEY trong file .env của backend." });
        }

        // Lấy RAG context từ database
        const productContext = await getProductContext();
        
        // Chuẩn bị lịch sử chat theo chuẩn OpenAI messages format
        const chatMessages = [
            { role: "system", content: SYSTEM_INSTRUCTION }
        ];

        // Chuyển đổi history sang format OpenAI
        if (history && history.length > 0) {
            for (const msg of history) {
                if (msg.role === 'system') continue;
                chatMessages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            }
        }

        // Thêm tin nhắn hiện tại của user kèm RAG context
        const contextualMessage = `[Dữ liệu sản phẩm]:\n${productContext}\n\n[Câu hỏi của khách]: ${message}`;
        chatMessages.push({ role: "user", content: contextualMessage });

        // Danh sách model free ưu tiên (fallback nếu bị rate-limit)
        const FREE_MODELS = [
            "google/gemma-4-31b-it:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "nousresearch/hermes-3-llama-3.1-405b:free",
            "qwen/qwen3-coder:free",
            "nvidia/nemotron-nano-9b-v2:free",
            "meta-llama/llama-3.2-3b-instruct:free"
        ];

        const headers = {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Luxe Furnish Chatbot'
        };

        // Thử lần lượt từng model, nếu bị 429 thì chuyển sang model tiếp theo
        let response = null;
        let lastError = null;
        for (const modelName of FREE_MODELS) {
            try {
                response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: modelName,
                    messages: chatMessages,
                    max_tokens: 1024
                }, { headers });
                
                // Kiểm tra response hợp lệ
                if (response.data.choices && response.data.choices[0]?.message?.content) {
                    console.log(`✅ Sử dụng model: ${modelName}`);
                    break;
                }
                response = null; // Reset nếu content rỗng
            } catch (err) {
                lastError = err;
                console.log(`⚠️ Model ${modelName} bị lỗi (${err.response?.data?.error?.code || err.message}), thử model tiếp...`);
                continue;
            }
        }

        if (!response) {
            throw lastError || new Error('Tất cả model free đều đang quá tải.');
        }

        const choice = response.data.choices[0];
        let aiMessage = choice.message.content || '';
        let action = null;

        // Kiểm tra xem AI có gọi function (tool_calls) không
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
            const call = choice.message.tool_calls[0];
            const args = JSON.parse(call.function.arguments);
            action = {
                name: call.function.name,
                args: args
            };
            
            // Xử lý các function ngầm ở Backend nếu cần
            if (call.function.name === 'create_support_ticket') {
                console.log("🔔 [ALERT] Đã ghi nhận Ticket khiếu nại: ", args.issue_description);
            }
        }

        // Tìm các sản phẩm được AI recommend bằng cú pháp [PRODUCT:id]
        const productIds = [];
        const regex = /\[PRODUCT:(\d+)\]/g;
        let match;
        while ((match = regex.exec(aiMessage)) !== null) {
            productIds.push(parseInt(match[1]));
        }

        let recommendedProducts = [];
        if (productIds.length > 0) {
            recommendedProducts = await Product.findAll({
                where: { id: productIds },
                attributes: ['id', 'name', 'price', 'discountPrice', 'mainImage']
            });
        }

        // Log tin nhắn của AI
        if (sessionId) {
            await ChatLog.create({ sessionId, userId: userId || null, role: 'model', message: aiMessage });
        }

        res.status(200).json({ 
            reply: aiMessage,
            action: action,
            recommendedProducts: recommendedProducts
        });

    } catch (error) {
        console.error("Lỗi AI Chat:", error.response?.data || error.message);
        res.status(500).json({ message: "Hệ thống tư vấn viên đang bận, vui lòng thử lại sau.", error: error.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const User = require('../models/user.model');
        const logs = await ChatLog.findAll({
            include: [{ model: User, attributes: ['id', 'username', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách chat logs.", error: error.message });
    }
};

exports.getAdminReplies = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const replies = await ChatLog.findAll({
            where: { sessionId, role: 'admin' },
            order: [['createdAt', 'ASC']]
        });
        res.status(200).json(replies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.adminReply = async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        const log = await ChatLog.create({ 
            sessionId, 
            role: 'admin', 
            message, 
            userId: req.user ? req.user.id : null 
        });
        res.status(200).json(log);
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
};

exports.generateDescription = async (req, res) => {
    try {
        const { name, type, style, segment, room } = req.body;
        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({ message: "Chưa cấu hình API Key" });
        }

        const prompt = `Viết một đoạn mô tả sản phẩm nội thất thật hấp dẫn, chuyên nghiệp và tối ưu tỷ lệ chuyển đổi (chốt sale) cho sản phẩm sau:
- Tên sản phẩm: ${name}
- Loại: ${type}
- Phong cách: ${style}
- Phân khúc: ${segment}
- Dành cho phòng: ${room}

Yêu cầu:
- Độ dài khoảng 80-150 từ.
- Nêu bật được sự sang trọng, tinh tế và chất lượng của sản phẩm.
- Khơi gợi cảm xúc và mong muốn sở hữu.
- Sử dụng tiếng Việt chuẩn xác, văn phong chuyên nghiệp.
- Tuyệt đối không dùng Markdown, chỉ trả về đoạn văn bản thuần (text text).
- KHÔNG có lời mở đầu hay kết thúc (VD: không viết "Dưới đây là...", "Hy vọng..."). Chỉ in ra phần mô tả.`;

        const FREE_MODELS = [
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemma-2-9b-it:free",
            "nousresearch/hermes-3-llama-3.1-405b:free",
            "meta-llama/llama-3.2-3b-instruct:free"
        ];

        const headers = {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Luxe Furnish'
        };

        let response = null;
        for (const modelName of FREE_MODELS) {
            try {
                response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: modelName,
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 350
                }, { headers });
                
                if (response.data.choices && response.data.choices[0]?.message?.content) {
                    break;
                }
            } catch (err) {}
        }

        if (response && response.data.choices) {
            return res.status(200).json({ description: response.data.choices[0].message.content.trim() });
        } else {
            return res.status(500).json({ message: "Không thể kết nối AI." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Lỗi tạo mô tả" });
    }
};
