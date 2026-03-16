export const generateB2BOrderNumber = (): string => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.floor(Math.random() * 9000 + 1000);
    return `B2B-${date}-${suffix}`;
};
