import axios from 'axios'; 
const server_url = "http://localhost:4000";

class contributionService {
    getContributions(userEmail) { 
        return axios.post(`${server_url}/api/contribution/getContributions/${userEmail}`);
    }

    deleteContribution(userEmail, category, id) {
        console.log(userEmail, category, id);
        return axios.delete(`${server_url}/api/contribution/deleteContribution/${userEmail}/${category}/${id}`);
    }
}

const newService = new contributionService();
export default newService;
