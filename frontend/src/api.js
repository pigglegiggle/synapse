import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const BANK_API = `${API_BASE_URL}/api/bank`;
const TEST_API = `${API_BASE_URL}/api/test`;
const PLATFORM_API = `${API_BASE_URL}/api`;

export const ingestTransaction = async (transaction) => {
    try {
        const response = await axios.post(`${BANK_API}/transaction`, transaction);
        return response.data;
    } catch (error) {
        console.error("Error ingesting transaction:", error);
        throw error;
    }
};

export const getGraphData = async ({ limit = 50, minRisk = 0 } = {}) => {
    try {
        const response = await axios.get(`${BANK_API}/graph`, {
            params: { limit, min_risk: minRisk }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching graph data:", error);
        throw error;
    }
};

export const getAccountDetails = async (id) => {
    try {
        const response = await axios.get(`${BANK_API}/account/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching account details:", error);
        throw error;
    }
};

export const generateData = async (count, scenario) => {
    try {
        const response = await axios.post(`${TEST_API}/generate`, { count, scenario });
        return response.data;
    } catch (error) {
        console.error("Error generating data:", error);
        throw error;
    }
};

export const resetSystem = async () => {
    try {
        const response = await axios.post(`${TEST_API}/reset`);
        return response.data;
    } catch (error) {
        console.error("Error resetting system:", error);
        throw error;
    }
};

export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${PLATFORM_API}/login`, { username, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getVerificationStats = async () => {
    try {
        const response = await axios.get(`${PLATFORM_API}/stats`);
        return response.data;
    } catch (error) {
        return { checked: 0, false_positives: 0 };
    }
};

export const updateVerificationStats = async (verdict) => {
    try {
        await axios.post(`${PLATFORM_API}/stats`, { verdict });
    } catch (error) {
        console.error("Stats update failed", error);
    }
};

export const verifyTransaction = async (id, verdict) => {
    try {
        await axios.post(`${BANK_API}/transaction/${id}/verify`, { verdict });
    } catch (error) {
        console.error("Verification failed", error);
        throw error;
    }
};
