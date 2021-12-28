import { createContext, ReactNode, useEffect, useState } from "react"
import { auth, firebase } from "../services/firebase"


type AuthContextType = {
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
}

type User = {
  id: string;
  name: string;
  avatar: string;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType)
//Guardando os dados o usuário para utilizar mais tarde
export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();
  //dispara uma função sempre que houver uma mudança no array
  useEffect(() => {
    //monitora se já havia sido feita a auntenticação do usuário no firebase, se sim ele busca ela novamente
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const { displayName, photoURL, uid } = user
        if (!displayName || !photoURL) {
          throw new Error('Missing information from Google Account.');
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    })

    return () => {
      unsubscribe();
    }
  }, [])

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);


    if (result.user) {
      const { displayName, photoURL, uid } = result.user;

      if (!displayName || !photoURL) {
        throw new Error('Missing information from Google Account')
      }
      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL
      })
    }

  }
  //O retorno serve para desligar a função
  return (
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {props.children}
    </AuthContext.Provider>
  );
}