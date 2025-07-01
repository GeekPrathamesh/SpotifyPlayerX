let listSongs = document.querySelector(".list-songs ul");
let cardsContainer = document.querySelector(".card-container");
let audio;
let play;
let hrefs;
let currFolder;
let albums;
const loadSongs = async (folder) => {
  let response = await fetch(`${folder}/songs.json`);
  let data = await response.json();

  // let div = document.createElement("div");
  currFolder = folder;
  // div.innerHTML = data;
  //   console.log(div);
  // let anchors = Array.from(div.getElementsByTagName("a"));
  // console.log(anchors);
  hrefs = data;
  // console.log(hrefs)
console.log(hrefs)
  // console.log(hrefs);
  updateSidelist(hrefs);
  clickList();
};

// task 1 updating side list

function updateSidelist(hrefs) {
  listSongs.innerHTML = "";
  for (let href of hrefs) {
    // let songName = href.split("/songs/")[1];
    let songName = href.split(".mp3")[0];
    songName = decodeURI(songName);
    // console.log(songName)
    // "http://127.0.0.1:3000/songs/128-Sairat%20Zaala%20Ji%20-%20Sairat%20128%20Kbps.mp3"
    listSongs.innerHTML += `<li>
      <i class="fa-solid fa-music"></i>
      <div class="song-info">
        <p>${songName}</p>
        <p>Bandu artist</p>
      </div>
      <i class="fa-solid fa-circle-play"></i>
    </li>`;
  }
}

function clickList() {
  let lists = Array.from(document.querySelectorAll(".list-songs ul li"));
  lists.forEach((list) => {
    list.addEventListener("click", () => {
      let songUrl =
        list.querySelector(".song-info").firstElementChild.textContent + ".mp3";
      // console.log(songUrl);
      audioPlay(songUrl);
    });
  });
}

function audioPlay(songUrl, value = false) {
  let link = `${currFolder}/` + songUrl;

  if (audio) {
    audio.pause();
  }
  audio = new Audio(link);
  if (!value) {
    audio.play();
    play = true;
    playSongBtn.classList.remove("fa-circle-play");
    playSongBtn.classList.add("fa-circle-pause");
  } else {
    audio.pause();
  }
  //////////songnameupdate///
  let songnameDisplay = document.querySelector(".song-Name");
  let decodedSongname = decodeURI(songUrl);
  decodedSongname = decodedSongname.replace(".mp3", "");
  songnameDisplay.innerText = decodedSongname;

  ////////////songtimeupdate////////
  audio.addEventListener("timeupdate", () => {
    const current = formatTime(audio.currentTime);
    const total = formatTime(audio.duration);
    document.querySelector(".song-time").innerText = `${current} / ${total}`;
    document.querySelector(".creekerball").style.left =
      (audio.currentTime / audio.duration) * 100 + "%";

    ///autoplay///
  });
  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  audio.addEventListener("ended", () => {
    let CurraudioSrc = decodeURIComponent(audio.src.split("/").pop());
    let index = hrefs.indexOf(CurraudioSrc);

    if (index + 1 < hrefs.length) {
      audioPlay(hrefs[index + 1]);
    }
  });
}

///////////pause btn//////////////////////
let playSongBtn = document.querySelector("#play");
playSongBtn.addEventListener("click", () => {
  if (play) {
    audio.pause();
    play = false;
    playSongBtn.classList.remove("fa-circle-pause");
    playSongBtn.classList.add("fa-circle-play");
  } else {
    audio.play();
    play = true;
    playSongBtn.classList.remove("fa-circle-play");
    playSongBtn.classList.add("fa-circle-pause");
  }
});

/////////next song play//////
let nextsongBtn = document.querySelector("#next");
nextsongBtn.addEventListener("click", () => {
  // console.log(audio.src);
  let CurraudioSrc = decodeURIComponent(audio.src.split("/").pop());
  let index = hrefs.indexOf(CurraudioSrc);

  if (index + 1 < hrefs.length) {
    audioPlay(hrefs[index + 1]);
  }
});

//////////////previous song button///////
let previoussongBtn = document.querySelector("#previous");
previoussongBtn.addEventListener("click", () => {
  let CurraudioSrc = decodeURIComponent(audio.src.split("/").pop());
  let index = hrefs.indexOf(CurraudioSrc);

  if (index > 0) {
    audioPlay(hrefs[index - 1]);
  }
});

/////////creeker movement//////////
let creeker = document.querySelector(".creeker");

creeker.addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  let creekerball = document.querySelector(".creekerball");
  creekerball.style.left = percent + "%";
  if (audio) {
    audio.currentTime = (audio.duration * percent) / 100;
  }
});

//////////////////volume change/////////
let volumeChange = document.querySelector(".volume-input");
document.querySelector("#volume").addEventListener("change", (e) => {
  if(audio){  audio.volume = e.target.value / 100;
  if (audio.volume === 0) {
    volumeChange.querySelector("i").classList.remove("fa-volume-high");
    volumeChange.querySelector("i").classList.add("fa-volume-xmark");
  } else {
    volumeChange.querySelector("i").classList.remove("fa-volume-xmark");
    volumeChange.querySelector("i").classList.add("fa-volume-high");
  }}

});

volumeChange.querySelector("i").addEventListener("click", (e) => {
  if (e.target.classList.contains("fa-volume-high")) {
    audio.volume = 0;
    document.querySelector("#volume").value = 0;
    volumeChange.querySelector("i").classList.remove("fa-volume-high");
    volumeChange.querySelector("i").classList.add("fa-volume-xmark");
  } else {
    audio.volume = 0.33;
    volumeChange.querySelector("i").classList.add("fa-volume-high");
    volumeChange.querySelector("i").classList.remove("fa-volume-xmark");
    document.querySelector("#volume").value = audio.volume * 100;
  }
});

async function main() {
  await loadSongs("Main/coldplay");
  audioPlay(hrefs[0], true);
  displayAlbums();
}
main();

async function displayAlbums() {
  let response = await fetch(`Main/albums.json`);
  let data = await response.json();
  // console.log(data);
  // let div = document.createElement("div");
  // div.innerHTML = data;
  albums = data;

  // albums = [];
  // for (let anchor of anchors) {
  //   if (anchor.href.includes("/Main/")) {
  //     // console.log(anchor.href);
  //     albums.push(anchor.href.split("/").slice(-2)[0]);
  //   }
  // }
  let html = "";
  for (let album of albums) {
    let response = await fetch(`Main/${album}/info.json`);
    let data = await response.json();
    html += `<div class="card" data-folder ="Main/${album}" >
              <img
                src="Main/${album}/cover.jpg"
                alt="playlist coverpage"
                loading="lazy"
              />
              <h2>${data.title}</h2>
              <p>${data.description}</p>
              <div class="play">
                <svg
                  class="play-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                  />
                </svg>
              </div>
            </div>`;
  }
  cardsContainer.innerHTML = html;
  let card = Array.from(document.querySelectorAll(".card"));
  card.forEach((eachCard) => {
    eachCard.addEventListener("click", async () => {
      let cardAddress = eachCard.dataset.folder;
      await loadSongs(cardAddress);
      audioPlay(hrefs[0]);
      if (window.innerWidth <= 1250) {
        document.querySelector(".hamberger").click();
      }
    });
  });
}

///////////////hamberger event listner
document.querySelector(".hamberger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0%";
});

/////////close x button for hamberger

document.querySelector(".xmark").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-100%";
});
