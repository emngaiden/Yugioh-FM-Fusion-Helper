import cards from './data/cards.json' assert {type: 'json'};
import fusions from './data/fusions.json' assert {type: 'json'};

const fusionsHeaders = ['Material1', 'Material2', 'Result'];
const resultExtraHeaders = ['Attack', 'Defense', 'CardType'];
const searchfield = document.getElementById("dropdown-input");
const dropdown = document.getElementById("dropdown");
const table = document.getElementById("table");
const tableBody = document.getElementById("table-body");
const nothing = document.getElementById("nothing");
const clearBtn = document.getElementById("clear-all");

const mem = new Map();
const fmem = new Map();

function init() {
  searchfield.addEventListener('change', changeClickHandler);
  searchfield.addEventListener('click', changeClickHandler);
  clearBtn.addEventListener('click', clear)
}

init();

function clear(event) {
  let child = dropdown.lastElementChild;
  while(child) {
    dropdown.removeChild(child)
    child = dropdown.lastElementChild;
  }
  child = tableBody.lastElementChild;
  while(child) {
    tableBody.removeChild(child);
    child = tableBody.lastElementChild;
  }
  nothing.style.display = 'block';
  searchfield.value = '';
  hideDropdown();
}

function changeClickHandler(event) {
    const text = event.target.value.toLowerCase();
    if('' === text) {
      return;
    }
    if(mem.has(text)) {
      populateAutoComplete(mem.get(text));
      showDropdown();
      return;
    }
    const filteredCardList = filterCardList(text);
    if(filteredCardList !== undefined) {
      mem.set(text, filteredCardList);
      populateAutoComplete(filteredCardList);
      showDropdown();
      return;
    }
}

function showDropdown() {
    dropdown.style.display = 'block';
}

function hideDropdown() {
  dropdown.style.display = 'none';
}

window.onclick = function(event) {
  if (!event.target.matches('#dropdown-input')) {
    hideDropdown();
  }
} 

function filterCardList(text) {
  if(text.trim() === '') {
    return undefined;
  }
  let isNum = /^\d+$/.test(text);
  return isNum ? filterByNumber(text) : filterByName(text);
}

function filterByNumber(number) {
  return [cards.find(item => parseInt(item.CardID) === parseInt(number))];
}

function filterByName(name) {
  let tempList = cards;
  for (const key of mem.keys()) {
    if(name.indexOf(key) === 0) {
      tempList = mem.get(key);
      break;
    }
  }
  return tempList.filter(item => item.CardName.toLowerCase().includes(name));
}

function populateAutoComplete(items) {
  let child = dropdown.lastElementChild;
  while(child) {
    dropdown.removeChild(child)
    child = dropdown.lastElementChild;
  }
  items.forEach(item => {
    let node = document.createElement('a');
    node.setAttribute('href', '#')
    node.setAttribute('id', item.CardID);
    node.appendChild(document.createTextNode(item.CardID + ' - ' + item.CardName));
    node.addEventListener('click', event => clickCard(item, event));
    dropdown.appendChild(node);
  });
}

function clickCard(card, event) {
  searchfield.value = card.CardName;
  hideDropdown();
  filterFusions(card);
  event.stopPropagation();
}

function filterFusions(card) {
  if(fmem.has(card.CardID)) {
    refreshTable(fmem.get(card.CardID));
    nothing.style.display = 'block';
    return;
  }
  let filteredFusions = fusions.filter(fusion => {
    return fusion.Material1 === card.CardID || fusion.Result === card.CardID
  });
  fmem.set(card.CardID, filteredFusions);
  if(filteredFusions.length > 0) refreshTable(filteredFusions, card);
  else nothing.style.display = 'block';
}

function refreshTable(filteredFusions, card) {
  nothing.style.display = 'none';
  let child = tableBody.lastElementChild;
  while(child) {
    tableBody.removeChild(child);
    child = tableBody.lastElementChild;
  }
  filteredFusions.forEach(fusion => {
    let fusionNode = document.createElement('tr');
    fusionsHeaders.forEach(header => {
      let td = document.createElement('td');
      let tdtxt = document.createTextNode(cards[fusion[header]-1].CardName);
      td.appendChild(tdtxt);
      fusionNode.appendChild(td);
    });
    resultExtraHeaders.forEach(header => {
      let td = document.createElement('td');
      let tdtxt = document.createTextNode(cards[fusion.Result-1][header]);
      td.appendChild(tdtxt);
      fusionNode.appendChild(td);
    })
    tableBody.appendChild(fusionNode);
  });
} 
