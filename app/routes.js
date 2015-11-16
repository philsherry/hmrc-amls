module.exports = {
  bind : function (app) {

  var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');


  // This builds the index navigation
	var services =  {
  		"services":[
	    	{ url: "property-possession", name: "Repossess a property" },
	    	{ url: "renew-passport", name: "Renew your passport"  },
	    	{ url: "apprenticeships", name: "Apply for an apprenticeship"  },
	    	{ url: "prison-visits", name: "Visit someone in prison"  },
	    	{ url: "registered-traveller", name: "Apply to be a registered traveller" },
	    	{ url: "redundancy-payments", name: "Claim redundancy payments"  },
	    	{ url: "vehicle-operators", name: "Apply for a vehicle operator’s licence" },
	    	{ url: "childminder", name: "Become a childminder" },
	    	{ url: "pip", name: "Personal Independence Payment" }
		]
	}


  // Render a page
  var renderPage = function(service, section, page, callback){

      // Read the data file for the relevant service
      var data = JSON.parse(fs.readFileSync('app/data/' + service + '.json', 'utf8'));

      // Get the section-level data for the page
      var pageData = data;
      sectionArray = section.split('/');

      // If the request contains sections
      if (sectionArray != ""){

        // Find the relevant section
        for(var i = 0; i < sectionArray.length; i++){

          var sectionIndex = Number(sectionArray[i]) - 1;

          // If it's the last section, add a flag so we can 
          // send people on to the next section
          var lastItem = false;
          if(sectionIndex + 1 == pageData.sections.length){
            lastItem = true;
          }

          var parentSection = pageData.name;

          pageData = pageData.sections[sectionIndex];
          pageData.lastItem = lastItem;
          pageData.parentSection = parentSection;

        }
      } else {
        pageData.lastItem2 = true;
      }


      // Number the current, previous and next pages
      var currentSection = Number(sectionArray[sectionArray.length - 1]);
      pageData.number = currentSection;
      pageData.next = currentSection + 1;
      pageData.prev = currentSection - 1;


      if (pageData.sections){

        // Number the sections
        for(var i = 0; i < pageData.sections.length; i++){

          // Number each section
          pageData.sections[i].number = i + 1;

          // Flag the last section
          if (i == pageData.sections.length - 1){
            pageData.sections[i].lastItem = true;
          } else {
            pageData.sections[i].lastItem = false; 
          }

          // If there are subsections
          if(pageData.sections[i].sections){
            for(var j = 0; j < pageData.sections[i].sections.length; j++){
              // Number each subsection
              pageData.sections[i].sections[j].number2 = j + 1;
            }    
          }  
        }  

        // If 1st section has subsections, assume they all do and
        // set flag so we can display the check page correctly
        if(pageData.sections[0].sections){
          pageData.subsections = true;
        }  

      }


      // Get the service-level data for the page
      pageData.service = data.service;


      // Don't show the service name in the header at the top level
      if(section == ""){
        pageData.service.name = "";
      } else {
        pageData.service.name = data.name;
        pageData.service.section = section.replace("/", ".");
      }

      return callback(null, pageData);

  }

  // ROUTES ================================== //


	// Index page

  app.get('/', function (req, res) {
    res.render('index', services);
  });


  // Service index page

  app.get("/service/:service/", function (req, res, next) {
    var service = req.params.service;
    renderPage(service, "", "start", function(error, data){
      return res.render('transaction-pages/start-page', data);
    })
  });


  // Service pages

  app.get("/service/:service/:page-page", function (req, res, next) {
    var service = req.params.service;
    var page = req.params.page;
    renderPage(service, "", page, function(error, data){


      return res.render('transaction-pages/' + page + '-page', data);



    })
  });


  // Section pages

  app.get("/service/:service/:section*/:subsections-page", function (req, res, next) {
    var service = req.params.service;
    var section = req.params.section;
    var subsections = req.params.subsections;
    var page = req.params[1];

    // Add subsections if there are any
    if(subsections){ section = section + subsections };

    renderPage(service, section, page, function(error, data){
      return res.render('transaction-pages/' + page + '-page', data);
    })

  });






  // AMLS Routes
  app.post('/:sprint/business-activities', function (req, res) {
    req.session.sections = 
      _.chain(require('./sections.js').slice())
      .filter(function (e, i) {
        return i > 1 && i < 9 ?
          _.find(req.body.activities, function (section) {
            return section == i;
          }) : true;
      })
      .value();

    res.redirect("/" + req.params.sprint + '/summary');
  });

  function getUrl(arr, memo) {
    var m = memo || '/';
    return arr.reduce(function (m, n, i) {
      return i === 0 ?
        m + n :
        m + '/' + n;
    }, m);
  }

  function fromReq(req, memo) {
    return getUrl([
      req.params.sprint,
      req.params.section,
      req.params.page
    ], memo);
  }

  function toFilePath(p) {
    return path.join.apply(null, p.split('/'));
  }

  function getSection(sections, section) {
    var sections = sections.entries(), current;
    do {
      current = sections.next();
      if (current.value[1].section === section)
        return [current, sections];
    } while (!current.done)
  }

  function nextSection(sections, section) {
    return getSection(sections, section)[1]
      .next()
      .value[1];
  }

  function updateSectionStatus(req, status) {
    var section = getSection(req.session.sections, req.params.section)[0];
    if (section.value[1].status === undefined) {
      req.session.sections[section.value[0]].status = status;
    }
  }

  app.get('/:sprint/:section/:page', function (req, res) {
    res.render(toFilePath(fromReq(req)));
  });

  app.post('/:sprint/:section/summary', function (req, res) {
    var next = nextSection(req.session.sections, req.params.section);
    updateSectionStatus(req, 'DONE');
    res.redirect(
      '/' + req.params.sprint +
      '/' + next.link
    );
  });

  app.post('/:sprint/:section/:page', function (req, res, next) {
    req.session[req.params.section] = req.session[req.params.section] || {};
    req.session[req.params.section][req.params.page] = req.body;
    var nextPage = req.body['next-page'];
    updateSectionStatus(req, 'IN PROGRESS');
    if (nextPage) {
      res.redirect(
        '/' + req.params.sprint +
        '/' + req.params.section +
        '/' + nextPage
      );
    } else {
      next();
    }
  });
    
  app.get('/:sprint/summary', function (req, res) {
    res.render(req.params.sprint + '/summary', {
      sections : req.session.sections
    });
  });

  app.get('/:sprint/:page', function (req, res) {
    res.render(req.params.sprint + '/' + req.params.page,
      req.session[req.params.page]);
    });
  }
};
