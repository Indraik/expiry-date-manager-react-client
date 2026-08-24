const API_BASE_URL = 'http://localhost:5001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const fetchProductsApi = async (queryParams = {}) => {
    const params = new URLSearchParams();
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.upc) params.append('upc', queryParams.upc);
    if (queryParams.expiryWithinMonths) params.append('expiryWithinMonths', queryParams.expiryWithinMonths);
    if (queryParams.status) params.append('status', queryParams.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/products${queryString}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
    }
    return data;
};

export const createProductApi = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMsg = data.errors?.[0]?.msg || data.message || 'Failed to create product';
        throw new Error(errorMsg);
    }
    return data;
};

export const updateProductApi = async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMsg = data.errors?.[0]?.msg || data.message || 'Failed to update product';
        throw new Error(errorMsg);
    }
    return data;
};

export const deleteProductApi = async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
    }
    return data;
};
