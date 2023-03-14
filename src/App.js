import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import firebaseConfig from './firebase.config';
import { GoogleAuthProvider, signOut } from "firebase/auth";
import { useState } from 'react';


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


function App() {
  const [newUser, setNewUser] = useState(false);
  const [userData, setUserData] = useState({
    isSignedIn: false,
    name: '',
    photo: '',
    email: '',
    password: '',
    error: false,
    success: false,
  })

  const provider = new GoogleAuthProvider();

  const handleSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
    .then((result) => {
      const { displayName, photoURL } = result.user;
      
      const signedInUsers = {
        isSignedIn: true,
        name: displayName,
        photo: photoURL,
      }
      setUserData(signedInUsers);
    })
    .catch((error) => {
      console.log(error);
      console.log(error.message);
    });
  }
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
    .then(() => {
      const signOutUser = {
        isSignedIn: false,
        name: '',
        photo: '',
        email: '',
      }
      setUserData(signOutUser);
    }).catch((error) => {
      // An error happened.
    });
  }

  const handleBlur = (event) => {
    let emailAndPass;
    if (event.target.name === 'name'){
      emailAndPass = event.target.value
    }
    if (event.target.name === 'email') {
      emailAndPass = /^\S+@\S+\.\S+$/.test(event.target.value)
    }
    if (event.target.name === 'password') {
      emailAndPass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(event.target.value)
    }
    if (emailAndPass) {
      const newUserInfo = {...userData}
      newUserInfo[event.target.name] = event.target.value
      setUserData(newUserInfo)
    }
  };

  const handleSubmit = (event) => {
  if (userData.email && userData.password) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
    const user = userCredential.user;
    const newUserInfo = {...userData}
    newUserInfo.success = true;
    setUserData(newUserInfo);
    updateUserInfo(user.displayName);
  })
  .catch(() => {
    const newUserInfo = {...userData}
    newUserInfo.error = true;
    setUserData(newUserInfo);
  })
  }
    event.preventDefault();
  };

  if (!newUser && userData.email && userData.password) {
    const auth = getAuth();
    //problem found for sign in with email and password (need fix this if section)
    signInWithEmailAndPassword(auth, userData.email, userData.password)
    .then((userCredential) => {
      const user = userCredential.user;
      const newUserInfo = {...userData}
      newUserInfo.success = true;
      setUserData(newUserInfo);
  })
    .catch(() => {
      const newUserInfo = {...userData}
      newUserInfo.error = true;
      setUserData(newUserInfo);
  });
  }

  const updateUserInfo = (name) => {
    const auth = getAuth();
    updateProfile(auth.currentUser, {
      displayName: name
    })
    .then(() => {
      console.log('name updated successfully');
    })
    .catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className='App'>
      { userData.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button>
      :<button onClick={handleSignIn}>Sign in</button>
      }
      {
        userData.isSignedIn && <h1>Welcome, {userData.name}</h1>
      }
      <h1>Our Own Authantication</h1>
      <form onSubmit={handleSubmit}>
        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
        <label htmlFor="">New User Form</label>
        <br />
        { newUser && <input type="text" onBlur={handleBlur} name='name' placeholder='Your Name' />}
        <br />
        <input type="email" name="email" onBlur={handleBlur} required placeholder='Your Email Address' />
        <br />
        <input type="password" name="password" onBlur={handleBlur} required placeholder='Your Password'/>
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign in'} />
      </form>
      {
        userData.error && <p style={{color: 'red'}}>This user already have an account</p>
      }
      {
        userData.success && <p style={{color: 'green'}}>You { newUser? 'Created' : 'Signed In'} Successfully</p>
      }
    </div>
  );
}

export default App;
