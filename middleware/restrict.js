const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            const err = new Error('You do not have permission to perform this action');
            err.statusCode = 403;
            return next(err);
        }

        next();
    };
};

export default restrictTo;