import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from "../../firebaseConfig";
import { SearchIcon, SunMedium } from "lucide-react";
import { useAuth } from "./AuthWrapper";
import  UserLoading  from "./UserLoading";
import Profile from './Profile';

function ChatPanel() {

  const [users, setUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLoading, setUserLoading] = useState(true);

  const { currUser } = useAuth();

  useEffect(() => {
    setUserLoading(true);
    const fetchUsers = (async () => {
      try {
        // 1. Get a reference to the 'users' collection
        const usersCollectionRef = collection(db, 'users');

        // 2. Fetch all documents in the collection
        const querySnapshot = await getDocs(usersCollectionRef);

        // 3. Map the documents to an array of user objects
        const usersArray = querySnapshot.docs.map(doc => ({
          id: doc.id, // The document ID is typically the user's UID
          ...doc.data() // The rest of the user data
        }));

        setUsers(usersArray);
        setUserLoading(false);
      } 
      catch (e) {
        console.error("Error fetching users: ", e);
        setUserLoading(false);
      }
    })();
  }, [db]);


  // Search Bar Logic
  let filterdUsers = users;
  if (searchQuery) {
      // filter chats based on search query
      filterdUsers = users.filter((user) =>
          user.username?.toLowerCase()?.startsWith(searchQuery?.toLowerCase())
      );
  }

  // Sort so currently logged in user is first
  const sortedUsers = [...filterdUsers].sort((a, b) => {
    if (a.id === currUser?.uid) return -1;
    if (b.id === currUser?.uid) return 1;
    return 0;
  });


  const onBack = () => {
    setShowProfile(false);
  }


  if(showProfile == true) {
    return <Profile onBack={onBack}></Profile>
  }


  return (
    <div className='flex flex-col w-[30vw] min-w-[200px] p-3 h-screen border-r-1 bg-blue-100'>
      
      {/* Profile */}
      <div className="flex items-center gap-6 py-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 h-14 rounded-md" >
        <div className="flex items-center">
          <img 
            onClick={() => { setShowProfile(true) }} 
            className='h-11 cursor-pointer object-cover rounded-full border-1 border-solid border-black ml-5 mr-4 ' 
            src={currUser?.photoURL || "/user.png"} alt="user" 
          />
          <p className="mr-auto">My Profile</p>
        </div>
        <SunMedium className="w-6 h-6 ml-auto mr-8" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white gap-4 px-3 py-2 rounded-lg mb-1 mt-3">
          <SearchIcon className="w-4 h-4" />
          <input
              className="w-full focus-within:outline-none"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
      </div>


      {/* Conditional rendering of loader */}
      {userLoading ? 
    
        <UserLoading></UserLoading> : <>

          {/* Chat List */}
          <div className="divide-y py-2 max-h-fit no-scrollbar overflow-y-scroll">
            {sortedUsers.map((user) => (
              <Link 
                className='flex items-center gap-2 px-3 py-2 mb-[1px] rounded-md bg-white hover:bg-blue-50 border-b-1 border-gray-300' 
                key={user.id} 
                to={`/chats/${user.id}`}
              >
                <img className='h-12 rounded-full border-1 object-cover border-solid border-black' src={user?.profile_pic || "/user.png"} alt="" />
                <p>
                  {user.id === currUser?.uid
                    ? `${user?.username} (You)`
                    : user?.username}
                </p>
              </Link>
            ))}
          </div>
        </>
      }
    </div>

  );
}

export default ChatPanel




