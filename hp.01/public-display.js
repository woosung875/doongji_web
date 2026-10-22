window.NestPublic = {
    address(value) {
        return String(value || '').replace(/(\S+(?:동|읍|면|리|가))\s+(?:산\s*)?\d+(?:-\d+)?(?=\s|,|$)/g, '$1').replace(/(\S+(?:로|길))\s+\d+(?:-\d+)?(?=\s|,|$)/g, '$1').replace(/\s{2,}/g, ' ').trim();
    },
    title(p) {
        return this.address(p.title || '');
    }
};
