$('body').on('hidden.bs.modal', '.modal', function () {
  $(this).removeData('bs.modal');
});

let FlexWindowHeight = $(window).height();
let FlexPageHeight = $(this).outerHeight();
let FlexPageRangeArray = []

$(document).ready(function () {
  let isAnimating = false;
  const scrollDelay = 500;
  const keyHoldDelay = 1500;
  const fastScrollInterval = 100;
  let keyTimeout;
  let fastScrollIntervalId;
  let heldKey;
  let allowSingleClick = true;
  let lastInteraction = new Date().getTime();
  const inactivityThreshold = 3000; // 3 seconds

  // Assign a page number to each .page-number element
  $(".custom-page").each(function (index) {
    $(this).find(".page-number").text(`Page ${index + 1}`);
  });

  const numberOfCustomPageElements = $('.custom-page').length;

  function CalculateScrollPosition() {
    var FlexWindowHeight = $(window).height();
    var FlexPageHeight = $(this).outerHeight(); //At startup shows total height for some reason? Do not know if this is reliable
    var scrollPosition = $(window).scrollTop();
  
    console.log("Number of Pages: " + numberOfCustomPageElements);
    console.log("New Flex Window Height: " + FlexWindowHeight)
    console.log("Flex Page Height: " + FlexPageHeight)
    console.log("Current Scroll Position: " + scrollPosition)
    console.log("Set to Page: " + Math.round((scrollPosition + FlexWindowHeight) / FlexWindowHeight))//(Current Scroll Position + New Flex Window Height) / New Flex Window Height
    var SetPage = Math.round((scrollPosition + FlexWindowHeight) / FlexWindowHeight)
    console.log("Set to Scroll Position: " + ((SetPage - 1) * FlexWindowHeight))//Determine Set Scroll Position
    var SetScrollPosition = (SetPage - 1) * FlexWindowHeight;

    return SetScrollPosition;
  }

  //Run this once
  CalculateScrollPosition();
  

  function goToPage(page) {
    if (isAnimating) return;
    isAnimating = true;

    $("html, body").animate(
      { scrollTop: $(page).offset().top },
      200,
      function () {
        isAnimating = false;
      }
    );
  }

  function nextPage(currentPage) {
    let next = $(currentPage).next(".custom-page");
    lastInteraction = new Date().getTime();
    if (next.length) {
      goToPage(next);
    }
  }

  function prevPage(currentPage) {
    let prev = $(currentPage).prev(".custom-page");
    lastInteraction = new Date().getTime();
    if (prev.length) {
      goToPage(prev);
    }
  }

  function getCurrentPage() {
    let scrollPosition = $(window).scrollTop();
    let currentPage;

    $(".custom-page").each(function () {
      let Offset = $(this).offset().top
      if (Offset <= scrollPosition) {
        currentPage = this;
        console.log("Offset Top: " + Offset);
        console.log("Scroll Position: " + scrollPosition);
      }
    });

    return currentPage;
  }

  function onWheel(event) {
    let currentPage = getCurrentPage();
    lastInteraction = new Date().getTime();
    console.log(lastInteraction)
    if (event.originalEvent.deltaY > 0) {
      nextPage(currentPage);
      console.log("Next Page")
    } else {
      prevPage(currentPage);
      console.log("Previous Page")
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function onKeydown(event) {
    const key = event.originalEvent.key;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
  
      if (!heldKey) {
        heldKey = key;
  
        // Execute onArrowKey for single clicks if allowed
        if (allowSingleClick) {
          onArrowKey(heldKey);
          allowSingleClick = false;
  
          // Re-enable single-click functionality after 1/10th of a second
          setTimeout(() => {
            allowSingleClick = true;
          }, 100);
        }
  
        keyTimeout = setTimeout(() => {
          fastScrollIntervalId = setInterval(() => {
            onArrowKey(heldKey);
          }, fastScrollInterval);
        }, keyHoldDelay);
      }
    }
  }
  
  function onKeyup(event) {
    const key = event.originalEvent.key;
    if (key === heldKey) {
      clearTimeout(keyTimeout);
      clearInterval(fastScrollIntervalId);
      heldKey = null;
    }
  }
  

  function onArrowKey(key) {
    let currentPage = getCurrentPage();
    lastInteraction = new Date().getTime();
    if (key === 'ArrowDown') {
      nextPage(currentPage);
    } else if (key === 'ArrowUp') {
      prevPage(currentPage);
    }
  }

  function alignCurrentPage() {
    $(".custom-page").each(function () {
      lastInteraction = new Date().getTime();
      var pageTop = $(this).offset().top;
      var pageHeight = $(this).outerHeight();
      var scrollPosition = $(window).scrollTop();
  
      if (((scrollPosition) % (pageTop)) !== 0 && pageTop !== 0) {
        var SetScrollPosition = CalculateScrollPosition();
        console.log("Setting New Scroll Position: " + SetScrollPosition)
        $("html, body").animate({ scrollTop: SetScrollPosition }, 200);
        return false;
      } else {
        console.log("Balanced")
      }
    });
  }

  setInterval(function () {
    let currentTime = new Date().getTime();
    if (currentTime - lastInteraction >= inactivityThreshold) {
      alignCurrentPage();
    }
  }, 3000);

  let debouncedWheelHandler = debounce(onWheel, scrollDelay);
  $(window).on("wheel", debouncedWheelHandler);

  // Add keydown and keyup event listeners
  $(window).on("keydown", onKeydown);
  $(window).on("keyup", onKeyup);

  function debounceWindow(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }
  
  const handleResize = debounceWindow(function() {
    let FlexWindowHeight = $(window).height();
    let FlexPageHeight = $(this).outerHeight();
    var x = 0
    if (FlexPageRangeArray.length > 0) {
      FlexPageRangeArray.length = 0;
    }
    while (x < numberOfCustomPageElements) {
      x = x + 1
      FlexPageRangeArray.push(x * FlexPageHeight);
    }
    console.log("Number of Pages: " + numberOfCustomPageElements);
    console.log("New Flex Window Height: " + FlexWindowHeight)
    console.log("Flex Page Height: " + FlexPageHeight)
    console.log("Height Array: " + FlexPageRangeArray)
  }, 1000);
  
  $(window).on('resize', handleResize);

});

document.addEventListener('DOMContentLoaded', () => {
  // Get the DOM elements
  const hamburgerButton = document.getElementById('hamburger-button');
  const sidebarMenu = document.querySelector('.sidebar-menu');
  const hamburgerLines = document.querySelectorAll('.hamburger-icon');
  const closeIcon = document.querySelector('.close-icon');
  const carlinText = document.querySelector('.carlin-text');

  // Set the initial state 
  let menuOpen = false;

  // Function to animate the hamburger button and toggle the sidebar menu
  function toggleMenu() {
    menuOpen = !menuOpen;

    // Toggle the sidebar menu
    sidebarMenu.classList.toggle('open');

    // Animate the hamburger button
    if (menuOpen) {
      hamburgerLines[0].animate(
        [
          { transform: 'translateY(0) rotate(0)', backgroundColor: 'black' },
          { transform: 'translateY(7px) rotate(45deg)', backgroundColor: '#d59e76' },
        ],
        {
          duration: 300,
          fill: 'forwards',
        }
      );

      hamburgerLines[1].animate(
        [
          { opacity: 1 },
          { opacity: 0 },
        ],
        {
          duration: 300,
          fill: 'forwards',
        }
      );

      hamburgerLines[2].animate(
        [
          { transform: 'translateY(0) rotate(0)', backgroundColor: 'black' },
          { transform: 'translateY(-7px) rotate(-45deg)', backgroundColor: '#d59e76' },
        ],
        {
          duration: 300,
          fill: 'forwards',
        }
      );
    } else {
      hamburgerLines[0].animate(
        [
          { transform: 'translateY(7px) rotate(45deg)', backgroundColor: '#d59e76' },
          { transform: 'translateY(0) rotate(0)', backgroundColor: 'black' },
        ],
        {
          duration: 300,
          fill: 'forwards',
        }
      );

      hamburgerLines[1].animate(
        [
          { opacity: 0 },
          { opacity: 1 },
        ],
        {
          duration: 300,
          fill: 'forwards',
        }
      );

      hamburgerLines[2].animate(
        [
          { transform: 'translateY(-7px) rotate(-45deg)', backgroundColor: '#d59e76' },
          { transform: 'translateY(0) rotate(0)', backgroundColor: 'black' },
        ],
        {
          duration: 300,
          fill: 'forwards',
        }
      );
    }

    // Toggle the Carlin Interactive text and close icon
    closeIcon.style.display = menuOpen ? 'inline' : 'none';
    carlinText.style.display = menuOpen ? 'inline' : 'none';

    if (menuOpen) {
      closeIcon.classList.add('visible');
      closeIcon.classList.remove('hidden');
      carlinText.classList.add('visible');
      carlinText.classList.remove('hidden');
    } else {
      closeIcon.classList.add('hidden');
      closeIcon.classList.remove('visible');
      carlinText.classList.add('hidden');
      carlinText.classList.remove('visible');
    }

  }

  // Add the event listener to the hamburger button
  hamburgerButton.addEventListener('click', toggleMenu);
});



//document.addEventListener('DOMContentLoaded', function() {
//  const hamburgerButton = document.getElementById('hamburger-button');
//  const sidebarMenu = document.querySelector('.sidebar-menu');

//  hamburgerButton.addEventListener('click', () => {
//    hamburgerButton.classList.toggle('transformed');
//    sidebarMenu.classList.toggle('open');
//  });
//});
