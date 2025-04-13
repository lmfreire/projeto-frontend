import api from "../services/api";

export async function validateTokenAndRedirect(router: any) {
  const token = localStorage.getItem("token_project");

  if (!token) {
    router.push("/");
    return false;
  }

  try {
    await api.get("/empresa/usuario", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (err) {
    localStorage.removeItem("token_project"); 
    router.push("/"); 
    return false;
  }
}