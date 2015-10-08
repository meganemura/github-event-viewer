"use strict";

var ghUrl = "https://github.com/";
var ghApiEndpoint = "https://api.github.com/";

var initialRepositories = ["babel/babel", "bower/bower", "bundler/bundler", "gulpjs/gulp", "lhorie/mithril.js", "npm/npm", "rails/rails"];
var initialRepository = initialRepositories[Math.floor(initialRepositories.length * Math.random())];

// Model
var GitHubEvent = {};
GitHubEvent.repositoryEvents = function (owner_and_repo) {
  return m.request({ dataType: "jsonp", url: ghApiEndpoint + "repos/" + owner_and_repo + "/events", background: true });
};

// Username with gravatar
var UserName = {
  view: function view(ctrl, args) {
    return m('a', { href: ghUrl + args.event.actor.login }, [m('img', { src: args.event.actor.avatar_url, width: 20, "class": 'img-rounded', hspace: 6 }), args.event.actor.login, ' ']);
  }
};

var CreateEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "created ", args.event.payload.ref_type, " ", m('a', { href: ghUrl + args.event.repo.name + "/tree/" + args.event.payload.ref }, args.event.payload.ref)]);
  }
};

var DeleteEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "deleted ", args.event.payload.ref_type, " ", args.event.payload.ref]);
  }
};

var ForkEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "forked"]);
  }
};

var GollumEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), args.event.payload.pages.map(function (page) {
      return [page.action, ' ', m('a', { href: ghUrl + page.html_url }, page.title)];
    })]);
  }
};

var IssueCommentEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' commented on issue ', m('a', { href: args.event.payload.comment.html_url }, ['#', args.event.payload.issue.number])]);
  }
};

var IssuesEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' ', args.event.payload.action, ' issue ', m('a', { href: args.event.payload.issue.html_url }, ['#', args.event.payload.issue.number])]);
  }
};

var MemberEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' ', args.event.payload.action, ' ', m('a', { href: args.event.payload.member.html_url }, [args.event.payload.member.login])]);
  }
};

var PullRequestEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' ', args.event.payload.action, ' pull request ', m('a', { href: args.event.payload.pull_request.html_url }, ['#', args.event.payload.pull_request.number])]);
  }
};

var PullRequestReviewCommentEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), ' commented on pull request ', m('a', { href: args.event.payload.comment.html_url }, ['#', args.event.payload.pull_request.number])]);
  }
};

var PushEvent = {
  view: function view(ctrl, args) {
    var numOfCommits = args.event.payload.commits.length;
    return m('span', [m.component(UserName, { event: args.event }), ' pushed ', numOfCommits.toString(), ' commit' + (numOfCommits == 1 ? '' : 's')]);
  }
};

var WatchEvent = {
  view: function view(ctrl, args) {
    return m('span', [m.component(UserName, { event: args.event }), "starred"]);
  }
};

var EventIcon = {
  view: function view(ctrl, args) {
    return m('span', {
      "class": 'octicon ' + EventIcon.octiconClass(args.event.type),
      title: args.event.type,
      'text-align': 'center'
    });
  },

  octiconClass: function octiconClass(type) {
    switch (type) {
      case 'CreateEvent':
        return 'octicon-git-branch';
      case 'DeleteEvent':
        return 'octicon-trashcan';
      case 'ForkEvent':
        return 'octicon-repo-forked';
      case 'GollumEvent':
        return 'octicon-book';
      case 'IssueCommentEvent':
        return 'octicon-comment-discussion';
      case 'IssuesEvent':
        return 'octicon-issue-opened'; // TODO: open/close
      case 'MemberEvent':
        return 'octicon-person';
      case 'PullRequestEvent':
        return 'octicon-git-pull-request';
      case 'PullRequestReviewCommentEvent':
        return 'octicon-comment-discussion';
      case 'PushEvent':
        return 'octicon-repo-push';
      case 'WatchEvent':
        return 'octicon-star';
      default:
        return 'octicon-question';
    }
  }
};

var RepositoryInputComponent = {
  view: function view() {
    return m('div', { "class": 'jumbotron' }, [m('h2', m('a', { href: '.', style: 'text-decoration: none; color: black' }, ['GitHub', m('span', { "class": 'mega-octicon octicon-mark-github', style: 'padding: 8px' }), 'Event Viewer'])), m('h3', ['github.com/', m('input', {
      placeholder: 'owner/repo',
      onchange: m.withAttr('value', vm.text),
      value: vm.text(),
      autofocus: true,
      onfocus: function onfocus(e) {
        if (e) {
          e.target.select();
        }
      },
      onkeydown: function onkeydown(e) {
        if (e.keyCode == 13) {
          vm.fetchEvents();
        } else {
          m.redraw.strategy("none");
        }
      }
    })]), m('p'), m('button', { onclick: vm.fetchEvents, "class": 'btn btn-lg btn-default' }, 'view')]);
  }
};

var RepositoryInformationComponent = {
  view: function view() {
    if (!$.isEmptyObject(vm.meta()) && vm.meta().status != 200) {
      return m('div', { "class": 'text-danger' }, "Something wrong");
    }
    return m('div', [vm.fetchedRepository() !== "" ? m('span', { "class": 'octicon octicon-repo', style: 'padding: 8px' }) : "", m('a', { href: ghUrl + vm.fetchedRepository() }, [vm.fetchedRepository()])]);
  }
};

var SpinnerComponent = {
  view: function view() {
    if (!vm.isLoading()) {
      return m('span');
    }
    return m('div', { "class": 'sk-three-bounce' }, [[1, 2, 3].map(function (i) {
      return m('div', { "class": "sk-child sk-bounce" + i });
    })]);
  }
};

var EventListComponent = {
  view: function view() {
    return m('table', { "class": 'table table-condensed' }, [m('tbody', vm.events().map(function (event) {
      var created_at = moment(event.created_at);
      return m('tr', [m('td', { align: 'center', "class": 'onepx' }, m.component(EventIcon, { event: event })), m('td', [vm.dispatchEvent(event), ' ', m('small', { "class": 'text-muted', title: created_at.toString() }, moment(event.created_at).fromNow())])]);
    }))]);
  }
};

var FooterComponent = {
  view: function view() {
    return m('div', [m('hr'), m('p', { "class": 'text-muted' }, [vm.rateLimit()]), m('p', { align: 'right' }, [m('span', { "class": 'octicon octicon-repo', style: 'padding: 8px', onclick: function onclick() {
        vm.text('meganemura/github-event-viewer');
      } }), m('a', { href: 'https://github.com/meganemura/github-event-viewer' }, ['meganemura/github-event-viewer'])])]);
  }
};

var vm = {
  init: function init() {
    vm.isLoading = m.prop(false);
    vm.text = m.prop(initialRepository);
    vm.fetchedRepository = m.prop("");
    vm.fetchEvents = function () {
      vm.isLoading(true);
      vm.events([]);
      GitHubEvent.repositoryEvents(vm.text()).then(function (data) {

        console.log(data); // for dev
        vm.meta(data.meta); // for dev

        if (data.meta["X-RateLimit-Remaining"] == '0') {
          vm.events([]);
        } else {
          vm.events(data.data);
        }
      }).then(function () {
        vm.isLoading(false);
      }).then(m.redraw);

      vm.fetchedRepository(vm.text());
    };
    vm.events = m.prop([]);

    vm.dispatchEvent = function (event) {
      switch (event.type) {
        case 'CreateEvent':
          return m.component(CreateEvent, { event: event });
        case 'DeleteEvent':
          return m.component(DeleteEvent, { event: event });
        case 'ForkEvent':
          return m.component(ForkEvent, { event: event });
        case 'GollumEvent':
          return m.component(GollumEvent, { event: event });
        case 'IssueCommentEvent':
          return m.component(IssueCommentEvent, { event: event });
        case 'IssuesEvent':
          return m.component(IssuesEvent, { event: event });
        case 'MemberEvent':
          return m.component(MemberEvent, { event: event });
        case 'PullRequestEvent':
          return m.component(PullRequestEvent, { event: event });
        case 'PullRequestReviewCommentEvent':
          return m.component(PullRequestReviewCommentEvent, { event: event });
        case 'PushEvent':
          return m.component(PushEvent, { event: event });
        case 'WatchEvent':
          return m.component(WatchEvent, { event: event });
        default:
          return [m.component(UserName, { event: event }), m('span', { "class": 'text-muted' }, ["('", event.type, "' Not Implemented)"])];
      }
    };

    vm.meta = m.prop({});
    vm.rateLimit = function () {
      if ($.isEmptyObject(vm.meta())) {
        return;
      }

      var reset_at = parseInt(vm.meta()["X-RateLimit-Reset"] || 0);
      return [m('a', { href: 'https://developer.github.com/v3/#rate-limiting' }, "API Rate Limit"), ": ", vm.meta()["X-RateLimit-Remaining"], "/", vm.meta()["X-RateLimit-Limit"], " (Reset at: ", moment.unix(reset_at).toString(), ")"];
    };
  }
};

var RootComponent = {
  controller: function controller() {
    vm.init();
    // vm.fetchEvents(); // for dev
  },
  view: function view() {
    return [m.component(RepositoryInputComponent), m.component(RepositoryInformationComponent), m.component(SpinnerComponent), m.component(EventListComponent), m.component(FooterComponent)];
  }
};

m.mount(document.getElementById('root'), RootComponent);