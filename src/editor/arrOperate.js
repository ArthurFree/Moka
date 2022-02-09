const arrProperties = {};

arrProperties.m_each = (cb) => {
    let i = 0;
    const { length } = this;

    for (; i < length; i++) {
        cb(this[i], i, this);
    }
};
