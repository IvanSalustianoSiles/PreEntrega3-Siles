import config from "../../config.js";

// Clase para controlar los métodos referentes a los usuarios.
class UserFSClass {
  constructor() {
    this.userArray = [];
    this.path = "../../jsons/user.json";
  }
  isRegistered = async (focusRoute, returnObject, req, res) => {
    try {
      return req.session.user
        ? res.render(focusRoute, returnObject)
        : res.redirect("/login");
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al cortejar los datos de usuario con la sesión.`);
    }
  };
  isRegisteredwToken = async (focusRoute, returnObject, req, res) => {
    try {
      return req.cookies[`${config.SECRET}_cookie`] 
      ? res.render(focusRoute, returnObject)
      : res.redirect("/jwtlogin");
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al cortejar los datos de usuario con el token.`);
    };
  };
  findUser = async (emailValue) => {
    try {
      await this.readFileAndSave();
      let myUser = this.userArray.find(user => user.email == emailValue);
      if (!myUser) return false;
      return myUser;
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al encontrar el usuario en el sistema de archivos.`);
    }
  };
  addUser = async (user) => {
    try {
    await this.readFileAndSave();
    const fsUser = this.userArray.push({ ...user });
    await this.updateFile(this.userArray);
    return fsUser;
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al agregar el usuario al sistema de archivos.`);
    }
  };
  updateUser = async (filter, update, options = { new: true }) => {
    try {
        this.readFileAndSave();
        let filteredUser = {};
        for (let i = 0; i < Object.values(filter).length; i++) {
          let filterValue = Object.values(filter)[i];
          let filterProp = Object.keys(filter)[i];
          this.userArray = this.userArray.filter(user => user[filterProp] == filterValue);
        };
        filteredUser = this.userArray[0];
        if (!filteredUser) return "[ERROR]: Error al encontrar el usuario a actualizar.";
        let updatedUser = filteredUser;
        await this.readFileAndSave();
        for (let i = 0; i < Object.values(update).length; i++) {
          let updateValue = Object.values(update)[i];
          let updateProp = Object.keys(update)[i];
          updatedUser[updateProp] = updateValue;
        };
        if (!updatedUser) return "[ERROR]: Error al actualizar el usuario.";
      
        if (options.new == true) {
          this.userArray.push(updatedUser);
          await this.updateFile(this.userArray);
          return updatedUser;
        } else {
          this.userArray.push(filteredUser);
          await this.updateFile(this.userArray);
          return filteredUser;
        };
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al actualizar el usuario en el sistema de archivos.`);
    };
  };
  deleteUser = async (filter) => {
    try {
      this.readFileAndSave();
      let filteredUser = {};
      for (let i = 0; i < Object.values(filter).length; i++) {
        let filterValue = Object.values(filter)[i];
        let filterProp = Object.keys(filter)[i];
        this.userArray = this.userArray.filter(user => user[filterProp] == filterValue);
      };
      filteredUser = this.userArray[0];
      await this.readFileAndSave();
      let filteredIndex = this.userArray.indexOf(filteredUser);
      this.userArray.splice(filteredIndex, 1);
      this.updateFile(this.userArray);
      return filteredUser;
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al eliminar el usuario en la base de datos.`);
    }
  };
  paginateUsers = async (filters = [{}, { page: 1, limit: 10 }]) => {
    try {
      this.readFileAndSave();
      let matrixUsers = [];
      let j = 0;
      matrixUsers.push([]);
      filters[0].role ? this.userArray = this.userArray.filter(user => user.role == filters[0].role)
      : this.userArray;

      for (let i = 0; i < this.productsArray.length; i++) {
        if (i == 0 || !(i % filters[1].limit == 0)) {
          matrixUsers[j].push(this.userArray[i]);
        } else {
          matrixUsers.push([]);
          j++;
          matrixUsers[j].push(this.userArray[i]);
        }
      }
  
      const pageUsers = matrixProducts[filters[1].page - 1];
      let prevPage = filters[1].page == 1 ? undefined : filters[1].page - 1;
      let nextPage = !matrixProducts[filters[1].page] ? undefined : filters[1].page + 1;
      let prevUrl;
      let nextUrl;

      if (filters[0].role) {
        prevPage
          ? (prevUrl = `/api/users?role=${filters[0].role}&page=${prevPage}&limit=${filters[1].limit}`)
          : null;
        nextPage
          ? (nextUrl = `/api/users?role=${filters[0].role}&page=${nextPage}&limit=${filters[1].limit}`)
          : null;
      } else {
        prevPage
          ? (prevUrl = `/api/users?page=${prevPage}&limit=${filters[1].limit}`)
          : null;
        nextPage
          ? (nextUrl = `/api/users?page=${nextPage}&limit=${filters[1].limit}`)
          : null;
      }
      return {
        status: "success",
        payload: pageUsers,
        prevLink: prevUrl,
        nextLink: nextUrl,
      };
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al paginar los usuarios desde el sistema de archivos.`);
    }
  };
  updateFile = async (array) => {
    fs.writeFileSync(`${this.path}`, JSON.stringify(array));
  };
  readFileAndSave = async () => {
    if (fs.existsSync(this.path)) {
      let fileContent = fs.readFileSync(this.path, "utf-8") || null;
      let parsedFileContent = JSON.parse(fileContent) || null;
      this.userArray = parsedFileContent || [];
    } else {
      this.updateFile(this.userArray);
    }
    return this.userArray;
  };
};

// Métodos a utilizar:
// isRegistered (focusRoute, returnObject, req, res)
// isRegisteredwToken (focusRoute, returnObject, req, res)
// findUser (emailValue)
// addUser (user)
// updateUser (filter, update, options)
// deleteUser (filter)
// paginateUsers (...filters)
// updateFile (array)
// readFileAndSave()

const UserFSService = new UserFSClass();

export default UserFSService;
