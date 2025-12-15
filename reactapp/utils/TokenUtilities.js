const saveAccessToken = (token) => {
    localStorage.setItem("token", token);
}

const getAccessToken = () => {
    return localStorage.getItem("token");
}

const removeAccessToken = () => {
    localStorage.removeItem("token");
}

export {
    saveAccessToken,
    getAccessToken,
    removeAccessToken
}