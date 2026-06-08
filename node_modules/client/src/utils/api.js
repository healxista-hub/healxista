/**
 * Global API Fetch Wrapper
 * Ensures authorization tokens are correctly passed and gracefully catches 401s
 * emitting an 'auth_expired' event so the AuthContext can log the user out cleanly.
 */

export const fetchApi = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const defaultHeaders = isFormData ? {} : {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        credentials: 'include',
        cache: options.cache || 'no-store', // Prevent caching across all roles
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    };

    try {
        const response = await fetch(endpoint, config);

        if (response.status === 401) {
            // Token expired or invalid
            window.dispatchEvent(new Event('auth_expired'));
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            // Optional: capture other errors
            throw new Error(`API Error: ${response.status}`);
        }

        // Return immediately if no content
        if (response.status === 204) return null;

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Fetch Error [${endpoint}]:`, error);
        throw error;
    }
};

/**
 * Resolves document paths to full URLs.
 * Handles both legacy root-level files and new role-based subfolders.
 */
export const getDocUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/uploads')) return path;
    return `/uploads/${path}`;
};

export default fetchApi;
