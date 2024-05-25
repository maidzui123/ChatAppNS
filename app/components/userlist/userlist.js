// app/components/userlist/userlist.js
const { ObservableArray, fromObject } = require("@nativescript/core");
const { Frame } = require("@nativescript/core");
const { firebase } = require("@nativescript/firebase-core");
const viewModel = fromObject({
  users: [],
});

export function onPageLoaded(args) {
  const page = args.object;
  page.bindingContext = viewModel;
  loadChats();
}

function loadChats() {
  const userId = firebase().auth().currentUser.uid;
  console.log("🚀 ~ loadChats ~ userId:", userId);
  const usersRef = firebase().database().ref("users");
  usersRef.on("value", (snapshot) => {
    const usersArray = [];
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      if (user.id !== userId) {
        usersArray.push({
          email: user.email,
          id: user.id,
        });
      }
    });
    console.log("🚀 ~ snapshot.forEach ~ usersArray:", usersArray);
    viewModel.set("users", usersArray);

    // viewModel.users = usersArray;
  });
}

// viewModel.onChatTap = function(args) {
//     const userId = args.view.bindingContext.id;
//     console.log("🚀 ~ chatId:", userId)

//     Frame.topmost().navigate({
//         moduleName: "components/chat/chatroom",
//         context: { userId: userId }
//     });
// };

// export function onChatTap(args) {
//     const userId = args.view.bindingContext.id;
//     console.log("🚀 ~ chatId:", userId)

//     Frame.topmost().navigate({
//         moduleName: "components/chat/chatroom",
//         context: { userId: userId }
//     });
// }

export function onChatTap(args) {
  const loggedInUserId = firebase().auth().currentUser.uid; // ID of the currently logged-in user
  const selectedUserId = args.view.bindingContext.id; // ID of the user selected from the list
  console.log("🚀 ~ selectedUserId:", selectedUserId);

  // Create a unique chatId using both user IDs
  const chatId = [loggedInUserId, selectedUserId].sort().join("_");

  // Check if the chat exists in Firebase
  const chatRef = firebase().database().ref(`chats/${chatId}`);
  chatRef.once("value", (snapshot) => {
    if (snapshot.exists()) {
      console.log("Chat exists. Navigating to chat room...");
    } else {
      console.log("Chat does not exist. Creating new chat...");
      // Optionally initialize the chat with some data
      chatRef.set({ createdOn: new Date().toISOString(), messages: [] });
    }
    // Navigate to the chat room with the determined or newly created chatId
    Frame.topmost().navigate({
      moduleName: "components/chat/chatroom",
      context: { chatId: chatId },
    });
  });
}
