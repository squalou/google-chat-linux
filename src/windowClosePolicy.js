const shouldQuitOnWindowClose = ({
    isQuitting,
    useTray,
    isSessionShuttingDown
}) => {
    return Boolean(isQuitting || !useTray || isSessionShuttingDown);
};

module.exports = {
    shouldQuitOnWindowClose
};
