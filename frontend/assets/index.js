appFunction();
avatarModalSetup();

function appFunction() {
  let localDataArray = [];
  function warningSign(array) {
    if (!array) {
      return;
    }
    const warning = document.querySelector("#warning");
    if (array.length > 0) {
      if (warning) warning.style.display = "none";
    } else if (array.length === 0) {
      if (warning) warning.style.display = "flex";
    }
  }

  warningSign(localDataArray);

  async function fetchDataFromDB() {
    try {
      const dataResponseJson = await fetch("/api/veillog/entries");

      if (!dataResponseJson.ok) {
        throw new Error();
      }
      const dataResponse = await dataResponseJson.json();
      localDataArray = dataResponse;
      getData(localDataArray);
    } catch (error) {
      console.log(`error while fetching entries route : ${error}`);
    }
  }

  fetchDataFromDB();
  searchFeature();
  // themeChanger();
  toggling();
  daySelection();
  typeSelectionFunction();
  noteCreation();

  function noteCreation() {
    const addEntry = document.querySelector(".addEntry");
    const emptyNoteAdd = document.querySelector("#emptyNoteAdd");

    addEntry.addEventListener("click", typeSelection);
    emptyNoteAdd.addEventListener("click", typeSelection);

    function typeSelection() {
      const bluredBg = document.querySelector(".bluredBg");
      bluredBg.style.display = "flex";
      document.body.append(bluredBg);
      document.querySelectorAll(".typeChoice").forEach((button) => {
        button.addEventListener("click", () => {
          const selectedType = button.textContent.toLowerCase().trim();
          formShow(selectedType);
          bluredBg.style.display = "none";
        });
      });
    }

    function formShow(type) {
      if (document.querySelector(`.${type}InputContainer`)) {
        return;
      }

      const container = document.createElement("div");
      container.setAttribute("class", `${type}InputContainer`);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("class", `${type}InputWrapper`);

      const logButtons = document.createElement("div");
      logButtons.setAttribute("class", "logButtons");

      const saveButton = document.createElement("button");
      saveButton.textContent = "Save entry";
      saveButton.setAttribute("class", "saveButton");

      const closeButton = document.createElement("button");
      closeButton.textContent = "Discard";
      closeButton.setAttribute("class", "closeButton");

      const headInput = document.createElement("input");
      headInput.className = `${type}HeadInput`;
      headInput.placeholder = `Write your ${type} heading`;

      wrapper.append(headInput);

      let timePicker, linkPicker, textInput;
      if (type === "todo") {
        timePicker = document.createElement("input");
        timePicker.setAttribute("type", "time");
        timePicker.className = "timePicker";
        wrapper.append(timePicker);
      }

      if (type === "open") {
        linkPicker = document.createElement("input");
        linkPicker.setAttribute("type", "url");
        linkPicker.placeholder = `Your ${type} Link`;
        linkPicker.className = `linkPicker`;
        wrapper.append(linkPicker);
      }

      if (type !== "todo" && type !== "open") {
        textInput = document.createElement("textarea");
        textInput.className = `${type}TextInput`;
        textInput.placeholder = `Your ${type} context`;
        wrapper.append(textInput);
      }

      logButtons.append(closeButton);
      logButtons.append(saveButton);
      wrapper.append(logButtons);

      container.append(wrapper);
      document.body.append(container);

      closeButton.addEventListener("click", () => {
        container.remove();
      });

      saveButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const heading = headInput.value.trim();
        let text, todoTime, openLink;

        if (type === "todo") {
          todoTime = timePicker.value;
          if (todoTime === "" || heading === "") {
            return toastFunction(
              "You need to input both field 🙂",
              "deleteToast",
            );
          }
        }
        if (type === "open") {
          openLink = linkPicker.value;
          if (openLink === "" || heading === "") {
            return toastFunction(
              "You need to input both field 🙂",
              "deleteToast",
            );
          }
        }
        if (type !== "todo" && type !== "open") {
          text = textInput.value.trim();
          if (text === "" || heading === "") {
            return toastFunction(
              "You need to input both field 🙂",
              "deleteToast",
            );
          }
        }

        const timeDateDigit = new Date();
        const timeDigit = timeDateDigit.toLocaleTimeString();
        const dateDigit = timeDateDigit
          .toLocaleDateString("en-GB")
          .replace(/\//g, ".");
        const numberedDate = timeDateDigit.getDate();
        const monthText = timeDateDigit.toLocaleDateString("en-GB", {
          month: "long",
        });
        const dayText = timeDateDigit.toLocaleDateString("en-GB", {
          weekday: "long",
        });

        const obj = {
          heading,
          text,
          type,
          date: dateDigit,
          time: timeDigit,
          dateNumber: numberedDate,
          month: monthText,
          day: dayText,
          todoTime,
          openLink,
        };

        try {
          const response = await fetch(`/api/veillog/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj),
          });

          const saved = await response.json();
          obj._id = saved._id;
          localDataArray.push(obj);
        } catch (error) {
          console.log(`error while seting data to db : ${error}`);
        }

        renderUI(obj);
        toastFunction(`${obj.type} is added`, "addToast");
        container.remove();
      });
    }
  }

  function getData(localDataArray) {
    localDataArray.forEach((element) => {
      renderUI(element);
    });
  }

  function renderUI(dataObject) {
    const contentPage = document.querySelector("#contentPage");
    warningSign(localDataArray);
    const type = dataObject.type;

    const logContainer = document.createElement("div");
    logContainer.className = `${type}Container`;
    logContainer.classList.add("activeShowUp");

    let log;
    if (type === "open") {
      log = document.createElement("a");
      log.href = dataObject.openLink;
      log.target = "_blank";
    } else {
      log = document.createElement("div");
    }

    log.className = type;

    const logTag = document.createElement("div");
    logTag.className = `${type}Tag`;
    const logTagText = document.createElement("p");
    logTagText.className = `${type}TagText`;
    logTagText.textContent = `${type}`;

    let logTagSVGPath;

    if (type === "todo") {
      logTagSVGPath =
        "M480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q63 0 120 19t105 54l-52 52q-37-26-81-39.5T480-792q-130 0-221 91t-91 221q0 130 91 221t221 91q130 0 221-91t91-221q0-21-3-41.5t-8-40.5l57-57q13 32 19.5 67t6.5 72q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm-55-211L264-468l52-52 110 110 387-387 51 51-439 439Z";
    }
    if (type === "open") {
      logTagSVGPath =
        "M432-288H288q-79.68 0-135.84-56.23Q96-400.45 96-480.23 96-560 152.16-616q56.16-56 135.84-56h144v72H288q-50 0-85 35t-35 85q0 50 35 85t85 35h144v72Zm-96-156v-72h288v72H336Zm192 156v-72h144q50 0 85-35t35-85q0-50-35-85t-85-35H528v-72h144q79.68 0 135.84 56.23 56.16 56.22 56.16 136Q864-400 807.84-344 751.68-288 672-288H528Z";
    }
    if (type === "note") {
      logTagSVGPath =
        "M144-264v-72h432v72H144Zm0-180v-72h672v72H144Zm0-180v-72h672v72H144Z";
    }
    if (type === "journal") {
      logTagSVGPath =
        "M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h408l192 192v408q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm0-72h528v-360H576v-168H216v528Zm72-72h384v-72H288v72Zm12-300h180v-72H300v72Zm-12 168h384v-72H288v72Zm-72-324v156-156 528-528Z";
    }

    const logTagSVGBox = "0 -960 960 960";

    const logTagSVG = createSVG(logTagSVGPath, 16, logTagSVGBox);
    logTagSVG.setAttribute("class", `${type}TagSVG`);

    logTag.append(logTagSVG, logTagText);
    log.append(logTag);

    const logHead = document.createElement("p");
    logHead.className = `${type}Head`;

    const logLastSection = document.createElement("div");
    logLastSection.className = `${type}LastSection`;

    let journalDateWrapper, journalDate, logPara;

    if (type === "journal") {
      journalDateWrapper = document.createElement("div");
      journalDateWrapper.setAttribute("class", "journalDateWrapper");

      journalDate = document.createElement("p");
      journalDate.setAttribute("class", "journalDate");

      journalDate.textContent = `${dataObject.date} ,${dataObject.month} ${dataObject.dateNumber}`;
      journalDateWrapper.append(journalDate);
      log.append(journalDateWrapper);
    }

    const createdData = document.createElement("div");
    createdData.setAttribute("class", "createdData");

    const correction = document.createElement("div");
    correction.setAttribute("class", "correction");

    const createdDateTime = document.createElement("p");
    createdDateTime.setAttribute("class", "createdDateTime");

    const logEdit = document.createElement("p");
    logEdit.className = "logEdit";
    logEdit.textContent = "edit";

    const logDelete = document.createElement("p");
    logDelete.className = "logDelete";
    logDelete.textContent = "delete";

    const moreModal = document.createElement("div");
    moreModal.className = `moreModal`;
    moreModal.append(logEdit, logDelete);

    const moreSVGPath =
      "M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z";

    const moreSVGBox = "0 -960 960 960";

    const moreSVG = createSVG(moreSVGPath, 16, moreSVGBox);
    moreSVG.setAttribute("class", "moreSVG");
    const moreSVGWrapper = document.createElement("div");
    moreSVGWrapper.className = `moreSVGWrapper`;
    moreSVGWrapper.append(moreSVG);
    document.body.appendChild(moreModal);

    moreSVG.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpened = moreModal.style.display === "flex";
      document
        .querySelectorAll(".moreModal")
        .forEach((m) => (m.style.display = "none"));

      if (isOpened) {
        moreModal.style.display = "none";
      } else {
        moreModal.style.display = "flex";

        const positioning = moreSVG.getBoundingClientRect();
        moreModal.style.top = `${positioning.bottom + 4}px`;
        moreModal.style.left = `${positioning.left - 48}px`;
      }
    });

    document.addEventListener("click", function (e) {
      if (!moreModal.contains(e.target) && !moreSVG.contains(e.target)) {
        moreModal.style.display = "none";
      }
    });
    createdDateTime.textContent = `${dataObject.date} | ${dataObject.time}`;
    logHead.textContent = dataObject.heading;

    log.append(logHead);
    if (type === "note") {
      const dividerLine = document.createElement("span");
      dividerLine.className = "dividerLine";
      log.append(dividerLine);
    }

    if (type !== "todo" && type !== "open") {
      logPara = document.createElement("p");
      logPara.setAttribute("class", `${type}Para`);
      logPara.textContent = dataObject.text;
      log.append(logPara);
    }

    createdData.append(createdDateTime);
    logLastSection.append(createdData);
    logLastSection.append(correction);
    correction.append(moreSVGWrapper);
    logContainer.append(log);

    if (type === "todo") {
      const dueTime = document.createElement("div");
      dueTime.className = "dueTime";

      const dueTimeText = document.createElement("p");
      dueTimeText.className = "dueTimeText";

      const todoTime = document.createElement("p");
      todoTime.className = "todoTime";

      todoTime.textContent = dataObject.todoTime;
      dueTimeText.textContent = `Todo is due to`;

      dueTime.append(dueTimeText);
      dueTime.append(todoTime);
      log.append(dueTime);
    }

    logContainer.append(logLastSection);

    const fragment = document.createDocumentFragment();
    fragment.append(logContainer);
    contentPage.appendChild(fragment);

    logDelete.addEventListener("click", async function () {
      try {
        const isDeleted = await fetch(
          `/api/veillog/${type}/${dataObject._id}`,
          {
            method: "DELETE",
          },
        );

        if (!isDeleted.ok) {
          throw new Error();
        }
        localDataArray = localDataArray.filter((el) => {
          return el._id !== dataObject._id;
        });

        toastFunction(`${type} is deleted`, "deleteToast");

        if (localDataArray.length === 0) {
          const warning = document.querySelector("#warning");
          if (warning) warning.style.display = "flex";
        }
        logContainer.remove();
      } catch (error) {
        console.log(`error while deleting data : ${error}`);
      }
    });

    logEdit.onclick = logEditAndSave;
    function logEditAndSave() {
      if (document.querySelector(`.${type}InputContainer`)) {
        return;
      }

      const container = document.createElement("div");
      container.setAttribute("class", `${type}InputContainer`);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("class", `${type}InputWrapper`);
      let textInput;
      const headInput = document.createElement("input");
      headInput.setAttribute("class", `${type}HeadInput`);
      headInput.value = logHead.textContent;

      wrapper.append(headInput);

      if (type !== "todo" && type !== "open") {
        textInput = document.createElement("textarea");
        textInput.className = `${type}HeadInput`;
        textInput.value = logPara.textContent;
        wrapper.append(textInput);
      }

      const logButtons = document.createElement("div");
      logButtons.setAttribute("class", "logButtons");

      const saveButton = document.createElement("button");
      saveButton.textContent = "Save entry";
      saveButton.setAttribute("class", "saveButton");

      const closeButton = document.createElement("button");
      closeButton.textContent = "Discard";
      closeButton.setAttribute("class", "closeButton");

      logButtons.append(closeButton);
      logButtons.append(saveButton);
      wrapper.append(logButtons);

      container.append(wrapper);
      document.body.append(container);

      closeButton.addEventListener("click", () => {
        container.remove();
      });

      saveButton.addEventListener("click", async function () {
        try {
          const editableObject = localDataArray.find((element) => {
            return element._id === dataObject._id;
          });
          let dbUpdateData = {};

          if (editableObject) {
            if (type !== "open" && type !== "todo") {
              if (editableObject.text !== textInput.value) {
                editableObject.text = textInput.value;
                logPara.textContent = textInput.value;
                dbUpdateData.text = textInput.value;
              }
            }
            if (editableObject.heading !== headInput.value) {
              editableObject.heading = headInput.value;
              logHead.textContent = headInput.value;
              dbUpdateData.heading = headInput.value;
            }
          }

          await fetch(`/api/veillog/${type}/${editableObject._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dbUpdateData),
          });
          container.remove();
        } catch (error) {
          console.log(`error while editting and saving : ${error}`);
        }
      });
    }
  }

  function toastFunction(message, name) {
    const toast = document.createElement("div");
    toast.innerHTML = `<p>${message}</p>`;
    toast.setAttribute("class", name);
    document.body.append(toast);
    setTimeout(() => toast.remove(), 5000);
  }
  function toggling() {
    const dropDownButtons = document.querySelectorAll(".dropDownButton");
    const sideBarIcon = document.querySelectorAll(".sideBarIcon");
    const sideBarToggler = document.querySelector(".sideBarToggler");

    dropDownButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();

        const dropDownMenu =
          button.parentElement.querySelector(".dropDownMenu");
        const dropDownText = button.querySelector(".dropDownText");
        const dropDownIcon = button.querySelector(".dropDownIcon");

        dropDownMenu.classList.toggle("hidden");
        dropDownText.classList.toggle("opened");
        dropDownIcon.classList.toggle("rotate");
      });
    });
    document.addEventListener("click", function (e) {
      const isSideBar = document.querySelector(".sideBar").contains(e.target);
      if (!isSideBar) {
        document.querySelector(".sideBar").classList.remove("full");
        document.querySelectorAll(".dropDownMenu").forEach((menu) => {
          menu.classList.add("hidden");
        });
        document.querySelectorAll(".dropDownText").forEach((icon) => {
          icon.classList.remove("opened");
        });
        document.querySelectorAll(".dropDownIcon").forEach((icon) => {
          icon.classList.remove("rotate");
        });
      }
    });

    sideBarToggler.addEventListener("click", function (e) {
      e.stopPropagation();
      document.querySelector(".sideBar").classList.toggle("full");
    });
    sideBarIcon.forEach((icon) => {
      icon.addEventListener("click", function (e) {
        e.stopPropagation();
        document.querySelector(".sideBar").classList.toggle("full");
        const toggle1 =
          icon.parentElement.parentElement.querySelector(".dropDownMenu");

        const toggle2 =
          icon.parentElement.parentElement.querySelector(".dropDownText");

        const toggle3 =
          icon.parentElement.parentElement.querySelector(".dropDownIcon");

        if (toggle1 && toggle2 && toggle3) {
          if (document.querySelector(".sideBar").classList.contains("full")) {
            toggle1.classList.remove("hidden");
            toggle2.classList.add("opened");
            toggle3.classList.add("rotate");
          } else {
            toggle1.classList.add("hidden");
            toggle2.classList.remove("opened");
            toggle3.classList.remove("rotate");
          }
        }
      });
    });
  }

  function typeSelectionFunction() {
    document.querySelectorAll(".typeSelection").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.textContent.trim().toLowerCase();
        // console.log(type);
        let presentableObject;
        if (type === "all") {
          presentableObject = localDataArray;
        } else {
          presentableObject = localDataArray.filter((el) => {
            return el.type === type;
          });
        }
        clearCards();
        warningSign(presentableObject);

        presentableObject.forEach((element) => {
          renderUI(element);
        });
      });
    });
  }

  function daySelection() {
    document.querySelectorAll(".daySelection").forEach((button) => {
      button.addEventListener("click", () => {
        const selectedDay = button.textContent.trim().toLowerCase();

        const gotDate = new Date();
        const todayYearOld = gotDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, ".");
        const yesterdayDate = new Date();
        yesterdayDate.setDate(gotDate.getDate() - 1);
        const oneYearOld = yesterdayDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, ".");

        let selectedDayArray;

        switch (selectedDay) {
          case "alltime":
            selectedDayArray = localDataArray;
            break;

          case "today":
            selectedDayArray = localDataArray.filter((el) => {
              return el.date === todayYearOld;
            });
            break;
          case "yesterday":
            selectedDayArray = localDataArray.filter((el) => {
              return el.date === oneYearOld;
            });
            break;
          case "over a week":
            selectedDayArray = localDataArray.filter((el) => {
              const [d, m, y] = el.date.split(".");
              const entryDate = new Date(`${y}-${m}-${d}`);
              return entryDate < new Date(Date.now() - 7 * 86400000);
            });
            break;

          case "over a month":
            selectedDayArray = localDataArray.filter((el) => {
              const [d, m, y] = el.date.split(".");
              const entryDate = new Date(`${y}-${m}-${d}`);
              return entryDate < new Date(Date.now() - 30 * 86400000);
            });
            break;

          default:
            selectedDayArray = localDataArray;
            break;
        }

        clearCards();
        warningSign(selectedDayArray);

        selectedDayArray.forEach((element) => {
          renderUI(element);
        });
      });
    });
  }

  function searchFeature() {
    const search = document.querySelector(".search");
    search.addEventListener("input", () => {
      const searchedWord = search.value.trim().toLowerCase();
      let searchedArray;
      searchedArray = localDataArray.filter((card) => {
        const head = (card.heading || "").trim().toLowerCase();
        const text = (card.text || "").trim().toLowerCase();
        return head.includes(searchedWord) || text.includes(searchedWord);
      });
      clearCards();
      warningSign(searchedArray);
      searchedArray.forEach((element) => {
        renderUI(element);
      });
    });
  }

  function createSVG(pathData, size = 16, box = "0 0 24 24") {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", box);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    return svg;
  }

  function clearCards() {
    document
      .querySelectorAll(
        ".noteContainer,.todoContainer,.journalContainer,.openContainer",
      )
      .forEach((card) => {
        card.remove();
      });
  }
}

function avatarModalSetup() {
  const avatarWrapper = document.querySelector(".avatarWrapper");
  const avatarModal = document.querySelector(".avatarModal");
  const accountName = document.querySelector(".accountName");
  const sessionInfo = document.querySelector(".sessionInfo");
  const logMeOut = document.querySelector(".logMeOut");

  avatarModalGetUserInfo();

  avatarWrapper.addEventListener("click", (e) => {
    e.stopPropagation();

    if (avatarModal.open) {
      avatarModal.close();
    } else {
      const positioning = avatarWrapper.getBoundingClientRect();
      avatarModal.style.top = `${positioning.bottom + 16}px`;
      avatarModal.style.left = `${positioning.left - 120}px`;
      avatarModal.show();
    }
  });

  async function avatarModalGetUserInfo() {
    const accountName = document.querySelector(".accountName");
    const sessionInfoText = document.querySelector(".sessionInfoText");

    try {
      const responseDataJson = await fetch("/user");

      if (!responseDataJson.ok) {
        throw new Error();
      }

      const responseData = await responseDataJson.json();
      accountName.textContent = responseData.username;
      sessionInfoText.textContent = "Logged in";
      // console.log(` user data : ${responseData}`);
    } catch (error) {
      console.log(`couldn't fetch userdata : ${error}`);
    }
  }

  logMeOut.addEventListener("click", function () {
    window.location.href = "/signout";
  });

  window.addEventListener("click", (e) => {
    const wrapperNeedToClose = avatarWrapper.contains(e.target);
    const ModalNeedToClose = avatarModal.contains(e.target);

    if (!wrapperNeedToClose && !ModalNeedToClose) {
      avatarModal.close();
    }
  });
}
