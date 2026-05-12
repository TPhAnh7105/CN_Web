module.exports = function(req, res, next) {
    // user is populated by auth.middleware
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Từ chối truy cập: Bạn không có quyền Quản trị viên.' });
    }
};
