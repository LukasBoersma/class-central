jQuery(function($) {

    $.ajaxSetup ({
        cache: false
    });

    courseListCheckboxHandler = function(){
        var clicked = this;
        // Check if the user is logged in
        $.ajax({
            url: "/ajax/isLoggedIn",
            cache: true
        })
            .done(function(result){

                var loggedInResult = $.parseJSON(result);
                var source = $(clicked).data('source');
                if(loggedInResult.loggedIn) {
                    ga('send','event','My Courses - Add Clicked',"Logged in", source);

                    var name = $(clicked).attr("name");
                    if($(clicked).is(':checked')) {
                        if( $('span[id=' + name + ']').html().trim() == '+' || $('span[id=' + name + ']').html().trim() == '-') {
                            // Course page
                            $('span[id=' + name + ']').html('-');
                        } else {
                            // Course Table
                            $('span[id=' + name + ']').removeClass("round-add-btn--plus");
                            $('span[id=' + name + ']').addClass("round-add-btn--minus");
                            // $('span[id=' + name + ']').html('<svg class="icon-minus" viewBox="0 0 32 32"><use xlink:href="#icon-minus"></use></svg>');
                        }

                        // uncheck the rest
                        $('input[name=' + name +']:checked').each(function(){
                            $(this).prop('checked',false);
                        });
                        // check this one back
                        $(clicked).prop('checked',true);
                    } else {
                        if( $('span[id=' + name + ']').html().trim() == '+' || $('span[id=' + name + ']').html().trim() == '-') {
                            $('span[id=' + name + ']').html('+');
                        } else {
                            $('span[id=' + name + ']').removeClass("round-add-btn--minus");
                            $('span[id=' + name + ']').addClass("round-add-btn--plus");
                        }

                    }

                    addRemoveCourse($(clicked).val(), $(clicked).data('course-id'),$(clicked).is(':checked'), $(clicked).data('course-name'));
                } else {
                    ga('send','event','My Courses - Add Clicked',"Logged out", source);

                    // Save the course details in the session
                    $.ajax({
                        url: "/signup/pre_cc/" + $(clicked).data('course-id') +  "/" + $(clicked).val(),
                    }).done(function(result){
                        // Show the singup popups
                        $('#signupModal-mooc_tracker_add_to_my_courses').modal('show');
                    });
                }
            });
    }

    $('#btn_add_search_term_to_mooc_tracker').click(function(e){
        e.preventDefault();
        $.ajax({
            url: "/signup/pre_q/" + escape($('#general-search #st-search-input').val()),
        }).done(function(result){
            // Show the singup popups
            $('#signupModal-mooc_tracker_search_terms').modal('show');
        });
    });

    // Handle calls to add/remove courses to users library
    $('input[class="course-list-checkbox"]').change( courseListCheckboxHandler );

    // Completed, Audited, Partially Completed, Dropped, Current
    var listCourseDone = [
        3,4,5,6
    ];

    // Enrolled
    var listEnrolled = [
        2
    ];

    function updateCounter( incr )
    {
        var start = parseInt( $('#mycourses-listed-count').text() );
        var end;
        if(incr) {
            end = start + 1;
        } else {
            end = start - 1;
        }

        var numAnim = new countUp("mycourses-listed-count", start, end, 0, 1);
        numAnim.start();
    }

    function addRemoveCourse(listId, courseId, checked,name) {
        try{
            if(checked){
                ga('send','event','My Courses - Add',listId.toString(), courseId.toString());
            }else {
                ga('send','event','My Courses - Remove', listId.toString(),  courseId.toString() );
            }
        }catch(err){}
        if(checked){
            $.ajax( "/ajax/user/course/add?c_id=" +courseId +"&l_id="+ listId)
                .done(
                function(result){
                    var r = JSON.parse(result);
                    if(r.success)
                    {
                        if( typeof courseAdded != 'undefined' && !courseAdded) {
                            updateCounter(true);
                            courseAdded = true;
                        }

                        if($.inArray(Number(listId), listCourseDone) >= 0)
                        {
                            askUserForRating(name,courseId,listId);
                        }
                        else if($.inArray(Number(listId), listEnrolled) >= 0)
                        {
                            // Ask them to review once they are done with the course
                            notifyWithDelay(
                                'Course added',
                                '<i>'+ name +'</i> added to <a href="/user/courses">My Courses</a> successfully. ' +
                                    'Don\'t forget to <a href="/review/new/' + courseId + '">review</a> the course once you finish it'
                                ,
                                'success',
                                30
                            );
                        }
                        else
                        {
                            // Interested
                            notify(
                                'Course added',
                                '<i>'+ name +'</i> added to <a href="/user/courses">My Courses</a> successfully',
                                'success'
                            );
                        }



                    }
                }
            );
        } else {
            $.ajax( "/ajax/user/course/remove?c_id=" +courseId +"&l_id="+ listId)
                .done(
                function(result){
                    var r = JSON.parse(result);
                    if(r.success)
                    {
                        // Decrement count - Course page
                        if( typeof courseAdded != 'undefined')
                        {
                            updateCounter(false);
                            courseAdded = false;
                        }
                        notify(
                            'Course removed',
                            '<i>'+ name +'</i> removed from <a href="/user/courses">My Courses</a> successfully',
                            'success'
                        );
                    }
                }
            );
        }
    }

    // Get notified for next session button - below Go To Class
    $('.btn-course-follow').click(function(e){
        e.preventDefault();
        var clicked = this;
        var courseName = $(clicked).data('course-name');
        var courseId = $(clicked).data('course-id');
        var source = $(clicked).data('source');
        var event = 'Get notified for next session button';
        if(source == 'follow') {
            event = 'Follow Class';
            if($('#follow-class').hasClass('active')) {
                return; // Do nothing
            }
        }
        $.ajax({
            url: "/ajax/isLoggedIn",
            cache: true
        })
            .done(function(result){
                var loggedInResult = $.parseJSON(result);
                if(loggedInResult.loggedIn) {

                    ga('send','event',event,"Logged in", courseName);
                    $.ajax( "/ajax/user/course/add?c_id=" +courseId +"&l_id=1")// 1 is the id for Interested Course in UserCourse.php
                        .done(
                        function(result){
                            var r = JSON.parse(result);
                            if(r.success)
                            {

                                    updateCounter(true);
                                    notify(
                                        'Notifications enabled',
                                        'You will receive notifications when a new session of <i>'+ courseName +'</i> is available',
                                        'success'
                                    );

                                // Hide the get notified button
                                $('#course-get-notified').hide("slow");

                                // Mark the course as followed
                                $('#follow-class').addClass('active');
                                $('#follow-class .action-button__unit:eq(1)').html('Following <i>Class</i>');
                            } else {

                            }
                        }
                    );
                } else {
                    ga('send','event',event,"Logged Out", courseName);
                    // Save the course details in the session
                    $.ajax({
                        url: "/signup/pre_cc/" + $(clicked).data('course-id') + "/1",
                        cache: true
                    }).done(function(result){
                        // Show the singup popups
                        $('#signupModal-btn_get_notified').modal('show');
                    });

                }
            });
    });

    function notify( title, text, type)
    {
        if ( !isMobile.phone ) {
            new PNotify({
                title: title,
                text: text,
                type: type,
                animation: 'show'
            });
        }
    }

    function notifyWithDelay( title, text, type, delay)
    {
        if ( !isMobile.phone ) {
            new PNotify({
                title: title,
                text: text,
                type: type,
                animation: 'show',
                delay: delay * 1000
            });
        }
    }

    // Select dropdown on course pages
    $('#sessionOptions').change(function() {
        var selected = $(this).find('option:selected');
        var url = selected.data("url");
        var sessionType = selected.data('sessiontype');
        var sessionStatus = selected.data('sessionstatus');
        var sessionStartDate = selected.data('sessionstartdate');

        // Update the user of the href tag
        $('#btnProviderCoursePage').attr("href",url);

        // Update the add to calendar button
        $('._start').html(sessionStartDate);
        $('._end').html(sessionStartDate);
        if(sessionType=='upcoming' && sessionStatus == '1') {
            $('.btnAddToCalendar').show();
        }
        else {
            $('.btnAddToCalendar').hide();
        }

    });


    // relevant to course information page and course tables
    // stop dropdown from closing when its inside elements are clicked on
    $('.course-button-group .dropdown-menu').bind('click', function (e) {
        //e.stopPropagation();
    });

    $('.table .dropdown-menu').bind('click', function (e) {
        //e.stopPropagation();
    });

    /**
     * User preferences - Newsletter
     */
    $('input[class="user-newsletter-checkbox"]').change(function(){
        var clicked = this;
        // Check if the user is logged in
        $.ajax({
            url: "/ajax/isLoggedIn",
            cache: true
        })
            .done(function(result){
                var loggedInResult = $.parseJSON(result);
                if(loggedInResult.loggedIn) {
                    updateSubscription($(clicked).val(), $(clicked).is(':checked'));
                } else {
                    // redirect to loginpage page
                    window.location.replace("/login");
                }
            });
    });

    var updateSubscription = function(code, checked) {
        try{
            if(checked){
                ga('send','event','Newsletter Preferences','Subscribed', code);
            }else {
                ga('send','event','Newsletter Preferences','Unsubscribed', code);
            }
        }catch(err){}

        if(checked){
            $.ajax( "/ajax/newsletter/subscribe/"+code)
                .done(
                function(result){
                    //console.log("jquery" + result);
                }
            );
        } else {
            $.ajax("/ajax/newsletter/unsubscribe/"+code)
                .done(
                function(result){
                    //console.log("jquery" + result);
                }
            );
        }
    }

    /**
     * User Preferences - MOOC Tracker preferences
     */
    $('input[class="mooc-tracker-checkbox"]').change(function(){
        var clicked = this;
        // Check if the user is logged in
        $.ajax({
            url: "/ajax/isLoggedIn",
            cache: true
        })
            .done(function(result){
                var loggedInResult = $.parseJSON(result);
                if(loggedInResult.loggedIn) {
                    updateUserPreference($(clicked).val(), $(clicked).is(':checked'));
                } else {
                    // redirect to loginpage page
                    window.location.replace("/login");
                }
            });
    });

    var updateUserPreference = function(prefId, checked) {
        try{
            if(checked){
                ga('send','event','MOOC Tracker Preferences','Checked', prefId);
            }else {
                ga('send','event','MOOC Tracker Preferences','UnChecked', prefId);
            }
        }catch(err){}
        if(checked){
            $.ajax( "/ajax/user/pref/"+ prefId + "/1")
                .done(
                function(result){
                    // console.log("jquery" + result);
                }
            );
        } else {
            $.ajax("/ajax/user/pref/"+ prefId + "/0")
                .done(
                function(result){
                    //console.log("jquery" + result);
                }
            );
        }
    }

    /**
     * Reviews and ratings
     */
    var isEmpty = function(str) {
        return (!str || 0 === str.length);
    }

    $('#review-text').autosize();

    loadRaty = function() {
        var ratyDefaults = {
            starHalf    : '/bundles/classcentralsite/slashpixel/images/star-half-gray.png',
            starOff     : '/bundles/classcentralsite/slashpixel/images/star-off-gray.png',
            starOn      : '/bundles/classcentralsite/slashpixel/images/star-on-gray.png',
            hints       : ['','','','',''],
            size        : 21,
            score       : function() {
                return $(this).attr('data-score');
            }
        };

        $('#rating').raty(ratyDefaults);

        $('.course-rating').raty($.extend(
            {
                readOnly: true
            },
            ratyDefaults
        ));

        $('.course-rating-course-page').raty({
            starHalf    : '/bundles/classcentralsite/slashpixel/images/star-half-blue.png',
            starOff     : '/bundles/classcentralsite/slashpixel/images/star-off-blue.png',
            starOn      : '/bundles/classcentralsite/slashpixel/images/star-on-blue.png',
            readOnly    : true,
            hints       : ['','','','',''],
            size        : 21,
            score       : function() {
                return $(this).attr('data-score');
            }
        });

        $('.credential-rating-page').raty({
            starHalf    : '/bundles/classcentralsite/slashpixel/images/star-half-blue.png',
            starOff     : '/bundles/classcentralsite/slashpixel/images/star-off-blue.png',
            starOn      : '/bundles/classcentralsite/slashpixel/images/star-on-blue.png',
            hints       : ['','','','',''],
            size        : 40,
            score       : function() {
                return $(this).attr('data-score');
            }
        });

        $('.user-rating').raty($.extend(
            {
                readOnly: true
            },
            ratyDefaults
        ));
    }

    loadRaty();

    /**
     * Review course
     */
    $('#submit-review').click(function(event){
        event.preventDefault();
        $('#submit-review').attr('disabled',true);

        var review = getReviewFormFields();
        var validationError = validateReviewForm(review);

        if(!validationError) {
            try{
                if(review.reviewId == ''){
                    ga('send','event', 'Create Review', " " + $('#courseId').data("value"));
                } else {
                    ga('send','event', 'Update Review'," " +  $('#courseId').data("value"));
                }
            } catch(err){}

            $.ajax({
                type:"post",
                url:"/user/review/create/" + $('#courseId').data("value"),
                data:JSON.stringify(review)
            })
                .done(
                function(result){
                    result = JSON.parse(result);
                    if(result['success']) {
                        // Redirect to the course page
                        window.location.href = $('#courseUrl').data("value");
                    } else {
                        // Show an error message
                    }
                }
            );

        } else {
            $('#submit-review').attr('disabled',false);

        }

    });

    $('#submit-signup-review').click(function(event){
        event.preventDefault();
        $('#submit-signup-review').attr('disabled', true);

        var review = getReviewFormFields();
        var validationError = validateReviewForm(review);

        if(!validationError) {
            $('#signupModal-create_course_review').on('hidden.bs.modal',function(e){
                window.location.href = $('#courseUrl').data("value");
            });
            $.ajax({
                type:"post",
                url:"/review/save/" + $('#courseId').data("value"),
                data:JSON.stringify(review)
            })
                .done(
                function(result){
                    result = JSON.parse(result);
                    if(result['success']) {
                        // Redirect back to the course page and ask the user if they want to signup for the course
                        window.location.href = $('#courseUrl').data("value");
                    } else {
                        // Show an error message
                        showPinesNotification('error','Some error occurred',result['message']);
                    }
                }
            );

        }

    });



    var getReviewFormFields = function() {
        // Get all the fields
        var rating = $('#rating').raty('score');
        var reviewText = $('textarea[name=review-text]').val();
        var effort = $('input:text[name=effort]').val();
        var progress = $('input:radio[name=progress]:checked').val();
        var difficulty = $('input:radio[name=difficulty]:checked').val();
        var level = $('input:radio[name=level]:checked').val();
        var offeringId = $('#sessionOptions').val();
        var status = $('#reviewStatus').val();
        var reviewId = $('#reviewid').data("value");
        var externalReviewerName = $('#ext-reviewer-name').val();
        var externalReviewLink = $('#ext-review-link').val();

        var review = {
            'rating': rating,
            'reviewText': reviewText,
            'effort': effort,
            'progress': progress,
            'difficulty': difficulty,
            'level':level,
            'offeringId':offeringId,
            'status':status,
            'reviewId':reviewId,
            'externalReviewerName': externalReviewerName,
            'externalReviewLink': externalReviewLink
        };

        return review;
    }

    var validateReviewForm = function(review) {
        // Validate the form
        var validationError = false;

        // Rating cannot be empty
        if(review.rating === undefined) {
            $('#rating-error').show();
            validationError = true;
        } else {
            $('#rating-error').hide();
        }

        // progress cannot be empty
        if(review.progress === undefined) {
            $('#progress-error').show();
            validationError = true;
        } else {
            $('#progress-error').hide();
        }

        // Review if exists should be atleast 20 words long
        // Make review text mandatory
        if(!isEmpty(review.reviewText)) {
            // Non empty review. Should be 20 words long
            var words = review.reviewText.split(' ');
            if(words.length < 20) {
                $('#review-text-error').show();
                validationError = true;
            } else {
                $('#review-text-error').hide();
            }
        } else {
            $('#review-text-error').show();
            validationError = true;
        }

        return validationError;
    }



    // Review feedback
    $('.review-feedback').bind('click',function(e){
        e.preventDefault();

        var helpful = $(this).text();
        var reviewId = $(this).data('reviewid');
        var feedback = (helpful === 'NO') ? 0 : 1;

        $.ajax("/ajax/review/feedback/"+ reviewId+"/"+feedback)
            .done(function(result){
                $('#review-feedback-'+reviewId).text("Thank you for your feedback.");
            });

    });

    // Default notification false
    //$.pnotify.defaults.history = false;

    var showPinesNotification = function(type,title,text){
        new PNotify({
            title: title,
            text: text,
            type: type,
            animation: 'show'
        });
    }

    // Pines notification
    $('.flash-message').each(function(index,element){

        if(!isMobile.phone) {
            new PNotify({
                title: $(element).data('title'),
                text: $(element).text(),
                type: $(element).data('type'),
                animation: 'show',
                delay: $(element).data('delay') * 1000
            });
        }

        var title = $(element).data('title');
        if( title == 'Logged in' ) {
            var autologin = getUrlParameter( 'autoLogin' );
            if( autologin != '' ) {
                ga('send','event', 'Logged In', 'Auto');
            } else {
                ga('send','event', 'Logged In', 'Manual');
            }
        }

        if( title == 'Logged in via Facebook' ) {
            ga('send','event', 'Logged In', 'Facebook');
        }
    });


    $('.faq-box .question').click( function() {
        var parent = $(this).parent();
        if (parent.hasClass('show-answer') ) {
            parent.find('.answer').hide();
            parent.toggleClass('show-answer');
        } else {
            parent.find('.answer').show();
            parent.toggleClass('show-answer');
        }
    });

    $('.faq-wrap .faq-question').click( function() {
        var parent = $(this).parent();
        if (parent.hasClass('show-answer') ) {
            parent.find('.faq-answer').hide();
            parent.toggleClass('show-answer');
        } else {
            parent.find('.faq-answer').show();
            parent.toggleClass('show-answer');
        }
    });

    // front page tab nav
    $(".section-tab-content").css("height", "0");
    defaultTab = $(".active-tab > a").data("target-section");
    $("." + defaultTab).css("height", "auto");
    $('nav.page-tabs').on('click', 'ul > li > a', function(event) {
        event.preventDefault();
        $this = $(this);
        targetTab = $this.data("target-section");
        if (targetTab !== undefined) {
            $(".section-tab-content").css("height", "0");
            $("." + targetTab).css("height", "auto");
            $("nav.page-tabs ul > li").removeClass("active-tab");
            $this.closest("li").addClass("active-tab");
            $.scrollTo('.page-tabs',{ duration: 400 });
        }
        else {
            // Check if the its the credentials tab
            if( $(this).attr('id') == 'home-credentials-tab') {
                targetTab ='home-credentials'
            } else {
                targetTab = 'create-free-account'; // signup button
            }
        }
        try {
            ga('send','event','Homepage Tab clicks',targetTab);
        } catch (e) {

        }

        if( $(this).attr('id') == 'home-credentials-tab') {
            window.location.href ='/certificate';
        }
    });

    $('.course-data-row .dropdown-menu input').click(function(e) {
        e.stopPropagation();
    });

    $('.course-data-row .dropdown-menu label').click(function(e) {
        e.stopPropagation();
    });

    // expand single reviews
    $('.expand-preview').on('click', function(e) {
        e.preventDefault();
        $this = $(this);
        $this.parent().hide();
        $this.closest(".review-content").find(".review-full").show();
        $this.hide();
    });


    /*
     Search functionality
     */
    var customRenderFunction = function(document_type, item) {
        var title = '<p class="title">' + item['name'] + '</p>';
        if(document_type == 'courses') {
            var ins = '';
            if(typeof item['institutions'] !== 'undefined' && item['institutions'] != '' ) {
                ins = item['institutions'][0] + ' - ';
            }
            var provider = '';
            if(typeof item['provider'] !== 'undefined' && item['provider'] != '' ) {
                provider = ' | ' + item['provider'];
            }

            return title.concat('<p>' + ins + item['displayDate'] + provider + '</p>');
        } else if (document_type == 'universities' || document_type == 'subjects') {
            return title.concat('<p class="genre">' + item['courseCount'] + ' courses </p>');
        }
    };

    // Navbar search button
    $('#navbar-search-btn').click(function(e){
        e.preventDefault();
        $('#navbar-search-form').submit();
    });


    $('#home-create-free-account').click( function(e){
        e.preventDefault();
        $('#signupModal-home_create_free_account').modal('show');
        try {
            ga('send','event','Create Free Account','Home Tab');
        }catch (e){}
    });

    $('#convincer-create-free-account').click( function(e){
        e.preventDefault();
        $('#signupModal-convincer_create_free_account').modal('show');
        try {
            ga('send','event','Create Free Account','Convincer');
        }catch (e){}
    });

    // Show signup form when someones click on Go To Class
    $('.btn_go_to_class').click( function(){
        var btnSignupCookie = 'btn_go_class_signup_shown';
        if ( Cookies.get( btnSignupCookie) === undefined ) {
            $.ajax({
                url: "/ajax/isLoggedIn",
                cache: true
            })
                .done(function(result){
                    var loggedInResult = $.parseJSON(result);
                    if( !loggedInResult.loggedIn) {

                        // Show the signup form
                        $('#signupModal-go_to_class').modal('show');
                    }
                }
             );
            Cookies.set( btnSignupCookie, 1, { expires :30} );
        }

    });

    // Typeahead

    $('#navbar-search-form #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 13) {

            if ($('#navbar-search-form .tt-suggestion.tt-cursor a').attr('href') !== undefined && $('#navbar-search-form .tt-suggestion.tt-cursor .search-view-all').length === 0) {
                var dataType = $('#navbar-search-form .tt-suggestion.tt-cursor a').data("type");
                var dataName = $('#navbar-search-form .tt-suggestion.tt-cursor a').data("name");
                window.location = $('#navbar-search-form .tt-suggestion.tt-cursor a').attr('href');
                try {
                    ga('send','event', 'Search Autocomplete' , dataType, dataName );
                }catch (e){}
            } else if ($('#navbar-search-form .tt-suggestion.tt-cursor .search-view-all').length ) {
                $('#navbar-search-form').submit();
                return false;
            } else if ( $this.is(":focus") ) {
                $('#navbar-search-form').submit();
            }
        }
    });

    var ccSearch = new Bloodhound({
        datumTokenizer: function (datum) {
            return Bloodhound.tokenizers.whitespace(datum.value);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 11,
        remote: {
            url: '/autocomplete/%QUERY',
            filter: function (data) {



                if (data.autocomplete[0].options.length > 0) {
                    var footerItem = {payload:{type:'footer-template', name: ''}};
                    var autoOptions = data.autocomplete[0].options;
                    var footerInArray = false;

                    $.each(autoOptions, function(key, value) {
                        if (value.payload.type === "footer-template") {
                            footerInArray = true;
                        }
                    });

                    if (footerInArray === false) {
                        autoOptions.push(footerItem)
                    }
                }

                return $.map(data.autocomplete[0].options, function (option) {
                    return {
                        payload: option.payload,
                        name: option.payload.name
                    };
                });

            }
        }
    });

    ccSearch.initialize();

    $('#navbar-search-form .cc-search-box')
        .typeahead(null, {
            name: '',
            displayKey: 'name',
            source: ccSearch.ttAdapter(),
            templates: {
                empty: [],
                suggestion: function (data) {
                    var templateScript;

                    if (data.payload.type === "course") {
                        templateScript = $("#course-template").html();
                    } else if (data.payload.type === "subject") {
                        templateScript = $("#subject-template").html();
                    } else if (data.payload.type === "credential") {
                        templateScript = $("#credential-template").html();
                    } else if (data.payload.type === "provider") {
                        templateScript = $("#provider-template").html();
                    } else if (data.payload.type === "institution") {
                        templateScript = $("#uni-template").html();
                    } else if (data.payload.type === "footer-template") {
                        templateScript = $("#footer-template").html();
                    } else {
                        templateScript = $("#base-template").html();
                    }

                    var suggestionTemplate = Handlebars.compile(templateScript);
                    return suggestionTemplate(data);
                }
            }
        })
        .on('typeahead:closed', function() {
            $('body.tt-is-open').removeClass('tt-is-open');
        }
    );

    $('#navbar-search-form .tt-dropdown-menu').on('click', '.search-view-all', function(e) {
        e.preventDefault();
        $('#navbar-search-form #st-search-input').val($('#navbar-search-form #st-search-input').typeahead('val'));
        $('#navbar-search-form').submit();
        return false;
    });


    $('#navbar-search-form .tt-dropdown-menu').bind("DOMSubtreeModified", function() {
        if  ($('#navbar-search-form .tt-dropdown-menu .tt-suggestion').length) {
            $('body').addClass('tt-is-open');
        } else {
            $('body.tt-is-open').removeClass('tt-is-open');
        }
    });

    $('#navbar-search-form #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 38 || e.which == 40 ) {
            if ($('#navbar-search-form .tt-suggestion.tt-cursor .suggestions-footer').length) {
                $this.val($this.typeahead('val'));
            }
        }
    });

    $(document).bind('keydown', function(e) {
        if(e.ctrlKey && (e.which == 76)) {
            e.preventDefault();
            $( "#navbar-search-form #st-search-input" ).focus();
            return false;
        }
    });


    //general search form typeahead


    $('#general-search #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 13) {

            if ($('#general-search .tt-suggestion.tt-cursor a').attr('href') !== undefined && $('#general-search .tt-suggestion.tt-cursor .search-view-all').length === 0) {
                var dataType = $('#general-search .tt-suggestion.tt-cursor a').data("type");
                var dataName = $('#general-search .tt-suggestion.tt-cursor a').data("name");

                window.location = $('#general-search .tt-suggestion.tt-cursor a').attr('href');

                try {
                    ga('send','event', 'Search Autocomplete' , dataType, dataName );
                }catch (e){}
            } else if ($('#general-search .tt-suggestion.tt-cursor .search-view-all').length ) {
                $('#general-search form').submit();
                return false;
            } else if ( $this.is(":focus") ) {
                $('#general-search form').submit();
            }
        }
    });

    $('#general-search .cc-search-box')
        .typeahead(null, {
            name: '',
            displayKey: 'name',
            source: ccSearch.ttAdapter(),
            templates: {
                empty: [],
                suggestion: function (data) {
                    var templateScript;

                    if (data.payload.type === "course") {
                        templateScript = $("#course-template").html();
                    } else if (data.payload.type === "subject") {
                        templateScript = $("#subject-template").html();
                    } else if (data.payload.type === "credential") {
                        templateScript = $("#credential-template").html();
                    } else if (data.payload.type === "provider") {
                        templateScript = $("#provider-template").html();
                    } else if (data.payload.type === "institution") {
                        templateScript = $("#uni-template").html();
                    } else if (data.payload.type === "footer-template") {
                        templateScript = $("#footer-template").html();
                    } else {
                        templateScript = $("#base-template").html();
                    }

                    var suggestionTemplate = Handlebars.compile(templateScript);
                    return suggestionTemplate(data);
                }
            }
        })
        .on('typeahead:closed', function() {
            $('body.tt-is-open').removeClass('tt-is-open');
        }
    );

    $('#general-search .tt-dropdown-menu').on('click', '.search-view-all', function(e) {
        e.preventDefault();
        $('#general-search #st-search-input').val($('#general-search #st-search-input').typeahead('val'));
        $('#general-search form').submit();
        return false;
    });


    $('#general-search .tt-dropdown-menu').bind("DOMSubtreeModified", function() {
        if  ($('#general-search .tt-dropdown-menu .tt-suggestion').length) {
            $('body').addClass('general-drop-is-open');
        } else {
            $('body.general-drop-is-open').removeClass('general-drop-is-open');
        }
    });

    $('#general-search #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 38 || e.which == 40 ) {
            if ($('#general-search .tt-suggestion.tt-cursor .suggestions-footer').length) {
                $this.val($this.typeahead('val'));
            }
        }
    });

    //html5 video play button
    function vidplay() {
        var video;
        $(".js-video-play").on("click", function(e) {
            $this = $(this);
            videoElement = $this.closest(".html5-video-container").find("video");
            video = videoElement.get(0);
            $overlayItems = $this.closest(".js-course-video").find(".js-video-overlay-item");
            if (video.paused) {
                video.play();
                $this.fadeOut(300);
                $overlayItems.fadeOut(300, function() {
                    videoElement.prop("controls",true);
                });
            } else {
                video.pause();
                $this.fadeIn(300);
                $overlayItems.fadeIn(300);
                videoElement.prop("controls",false);
            }

        });
    }

    vidplay();

    askUserForRating = function(name, courseId, listId){

        ga('send','event','Rating Popup - Shown',name, listId);

        var source   = $("#rating-popup").html();
        var template = Handlebars.compile(source);
        var html    = template({'rating' : 0});

        swal({
            title: "<span style='font-size: 20px'>How would you rate '<em>" + name + "</em>'?</small></span>",
            text: html,
            html: true,
            showCancelButton: true,
            showConfirmButton: false
        });

        var ratyDefaults = {
            starHalf    : '/bundles/classcentralsite/slashpixel/images/star-half-gray.png',
            starOff     : '/bundles/classcentralsite/slashpixel/images/star-off-gray.png',
            starOn      : '/bundles/classcentralsite/slashpixel/images/star-on-gray.png',
            hints       : ['','','','',''],
            size        : 21,
            score       : function() {
                return $(this).attr('data-score');
            },
            click       : function(score, evt) {
                ga('send','event','Rating Popup - Course Rated',name, listId);

                // Save the review
                var review = {
                    'rating': score,
                    'progress': listId,
                    'reviewText' :'',
                    'showNotification' : false
                };

                $.ajax({
                    type:"post",
                    url:"/user/review/create/" + courseId,
                    data:JSON.stringify(review)
                })
                    .done(
                    function(result){
                        result = JSON.parse(result);
                        if(result['success']) {
                            swal("Course has been rated", "Thank you for providing feedback", "success");
                        } else {
                            ga('send','event','Rating Popup - Course Rating Unsuccesful',name, listId);
                            swal("Error", result.message, "error");
                        }
                    }
                );

            }
        };

        $('#rating').raty(ratyDefaults);

    }

    // Fire Google Analytic events for signup
    var userSignedUp = getUrlParameter('ref');
    var userSignedUpSrc = getUrlParameter('src');
    if( (typeof userSignedUp !== undefined) && userSignedUp == 'user_created') {
        if (userSignedUpSrc != '') {
            ga('send','event','New User Created', userSignedUpSrc);
        } else {
            ga('send','event','New User Created');
        }

    }




    function getUrlParameter(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }

        return '';
    }

    // Redirect back to the previous page on newsletter-signup flow
    $('#newsletter-subscribe-cancel-button').click( function(){
        var previous = document.referrer;
        window.location.replace(previous);
    } );

    var signupForms = ['mooc_tracker_add_to_my_courses','btn_get_notified','go_to_class','credential_create_free_account','mooc_tracker_search_terms',
        'home_create_free_account','convincer_create_free_account','create_course_review','create_credential_review','btn_follow'];
    for(var i =0 ; i < signupForms.length; i++)
    {
        var signupFormId = "#signupModal-" + signupForms[i];
        // mini slider functionality
        $( signupFormId + " .js-mini-slider" ).each(function( index, element ) {
            $(element).flexslider({
                selector: " .js-mini-slider-slides .js-mini-slider-slide",
                slideshow: true,
                slideshowSpeed: 4000,
                directionNav: false,
                manualControls: signupFormId +  " .js-mini-slider-controls .js-mini-slider-control"
            });

            var $slide = $(element).find(" .js-mini-slider-slide");

            var numberOfSlides = $slide.length;

            $slide.on("click", function(e) {
                $(element).flexslider("next");
            });
        });

    }

    $('.review-status-update').click(function(event){
        event.preventDefault();
        $.ajax({
            type:"get",
            url:$(this).attr('href')
        })
            .done(
            function(result){
                result = JSON.parse(result);
                if(result['success']) {
                    notify(
                        'Review Status Updated',
                        '',
                        'success'
                    );
                } else {
                    notify('Review Status Not Updated','','error')   ;
                }
            }
        );
    });

    $(".js-faded-collapse-toggle").on("click", function(e) {
        e.preventDefault();

        var $this = $(this);

        var target = $this.attr("href");
        $target = $(target);

        var expandedText = "Collapse";

        if ($target.hasClass("collapsed")) {

            $this.data("origHeight", $target.innerHeight());
            $target.css("height", "auto");
            $this.data("targetHeight", $target.innerHeight());
            $target.css("height", $this.data("origHeight"));

            $target.innerHeight($this.data("targetHeight"));
            $target.removeClass("collapsed").addClass("expanded");

            $this.data("collapsedText", $this.text());

            $this.text(expandedText);
            $this.removeClass("collapsed").addClass("expanded");

        } else {

            $target.innerHeight($this.data("origHeight"));
            $target.removeClass("expanded").addClass("collapsed");
            $this.text($this.data("collapsedText"));
            $this.removeClass("expanded").addClass("collapsed");
        }

    });

    if ($("html").hasClass("no-touch")) {
        if ($(window).width() > 800 ) {
            $("#sticky-cred").stick_in_parent();
        }
        $( window ).resize(function() {
            if ($(window).width() > 800 ) {
                $("#sticky-cred").stick_in_parent();
            } else {
                $("#sticky-cred").trigger("sticky_kit:detach");
            }
        });
    }

    // make ads sticky
    if ($("html").hasClass("no-touch")) {
        if ($(window).width() > 768 ) {
            $(".js-sticky-in-parent-row").stick_in_parent({
                parent: '.row'
            });
        }
        $( window ).resize(function() {
            if ($(window).width() > 768 ) {
                $(".js-sticky-in-parent-row").stick_in_parent({
                    parent: '.row'
                });
            } else {
                $(".js-sticky-in-parent-row").trigger("sticky_kit:detach");
            }
        });
    }




    $('[data-toggle="tooltip"]').tooltip();

});
