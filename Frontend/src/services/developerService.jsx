import axios from 'axios';
const server_url = "http://localhost:4000";

class developerService {

    getDevelopers() {
        return axios.get(server_url + '/api/developer/getDevelopers');
    }
}

const newService = new developerService();
export default newService;