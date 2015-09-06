var ghUrl = "https://github.com/"
var ghApiEndpoint = "https://api.github.com/"

var initialRepositories = [
  "babel/babel",
  "bower/bower",
  "bundler/bundler",
  "gulpjs/gulp",
  "lhorie/mithril.js",
  "npm/npm",
  "rails/rails",
]
var initialRepository = initialRepositories[Math.floor(initialRepositories.length * Math.random())]

var GitHubEvent = {}
GitHubEvent.repositoryEvents = function(owner_and_repo) {
  return m.request({dataType: "jsonp", url: ghApiEndpoint + "repos/" + owner_and_repo + "/events"});
};

// Username with gravatar
var UserName = {
  view: function(ctrl, args) {
    return m('a', {href: ghUrl + args.data.actor.login}, [
      m('img', {src: args.data.actor.avatar_url, width: 20, class: 'img-rounded', hspace: 6}),
      args.data.actor.login,
      ' ',
    ]);
  },
}

var ForkEvent = {
  view: function(ctrl, args) {
    return m('span', [
      m.component(UserName, {data: args.data}),
      "forked",
    ])
  },
}

var GollumEvent = {
  view: function(ctrl, args) {
    return m('span', [
      m.component(UserName, {data: args.data}),
      args.data.payload.pages.map(function(page) {
        return [
          page.action,
          ' ',
          m('a', {href: ghUrl + page.html_url}, page.title),
        ];
      }),
    ])
  },
}

var IssueCommentEvent = {
  view: function(ctrl, args) {
    return m('span', [
      m.component(UserName, {data: args.data}),
      ' commented on issue ',
      m('a', {href: args.data.payload.comment.html_url}, [
        '#',
        args.data.payload.issue.number,
      ]),
    ])
  },
}

var IssuesEvent = {
  view: function(ctrl, args) {
    return m('span', [
      m.component(UserName, {data: args.data}),
      ' ',
      args.data.payload.action,
      ' issue ',
      m('a', {href: args.data.payload.issue.html_url}, [
        '#',
        args.data.payload.issue.number,
      ]),
    ])
  },
}

var PullRequestEvent = {
  view: function(ctrl, args) {
    return m('span', [
      m.component(UserName, {data: args.data}),
      ' ',
      args.data.payload.action,
      ' pull request ',
      m('a', {href: args.data.payload.pull_request.html_url}, [
        '#',
        args.data.payload.pull_request.number,
      ]),
    ])
  },
}

var PullRequestReviewCommentEvent = {
  view: function(ctrl, args) {
    return m('span', [
      m.component(UserName, {data: args.data}),
      ' commented on pull request ',
      m('a', {href: args.data.payload.comment.html_url}, [
        '#',
        args.data.payload.pull_request.number,
      ]),
    ])
  },
}

var PushEvent = {
  view: function(ctrl, args) {
    var numOfCommits = args.data.payload.commits.length;
    return m('span', [
      m.component(UserName, {data: args.data}),
      ' pushed ',
      numOfCommits.toString(),
      ' commit' + ((numOfCommits == 1) ? '' : 's'),
    ])
  },
}

var WatchEvent = {
  view: function(ctrl, args) {
    return m('span', [
      m.component(UserName, {data: args.data}),
      "starred",
    ])
  },
}

var EventIcon = {
  view: function(ctrl, args) {
    return m('span', {
      class: 'octicon ' + this.octiconClass(args.data.type),
      title: args.data.type,
      'text-align': 'center',
    });
  },

  octiconClass: function(type) {
    switch (type) {
      case 'CreateEvent':       return 'octicon-git-pull-request';
      case 'DeleteEvent':       return 'octicon-trashcan';
      case 'ForkEvent':         return 'octicon-repo-forked';
      case 'GollumEvent':       return 'octicon-book';
      case 'IssueCommentEvent': return 'octicon-comment-discussion';
      case 'IssuesEvent':       return 'octicon-issue-opened';  // TODO: open/close
      case 'PullRequestEvent':  return 'octicon-git-pull-request';
      case 'PullRequestReviewCommentEvent': return 'octicon-comment-discussion';
      case 'PushEvent':         return 'octicon-repo-push';
      case 'WatchEvent':        return 'octicon-star';
      default: return 'octicon-question';
    }
  },
}

var vm = {
  init: function() {
    vm.text = m.prop(initialRepository);
    vm.fetchEvents = function() {
      vm.events([]);
      GitHubEvent.repositoryEvents(vm.text())
      .then(function(data) {

        console.log(data);  // for dev
        vm.meta(data.meta);  // for dev

        if (data.meta["X-RateLimit-Remaining"] == '0') {
          vm.events([]);
        } else {
          vm.events(data.data);
        }
      });
    };
    vm.events = m.prop([]);

    vm.dispatchEvent = function(event) {
      switch (event.type) {
        case 'ForkEvent':                     return m.component(ForkEvent,                      {data: event})
        case 'GollumEvent':                   return m.component(GollumEvent,                    {data: event})
        case 'IssueCommentEvent':             return m.component(IssueCommentEvent,              {data: event})
        case 'IssuesEvent':                   return m.component(IssuesEvent,                    {data: event})
        case 'PullRequestEvent':              return m.component(PullRequestEvent,               {data: event})
        case 'PullRequestReviewCommentEvent': return m.component(PullRequestReviewCommentEvent,  {data: event})
        case 'PushEvent':                     return m.component(PushEvent,                      {data: event})
        case 'WatchEvent':                    return m.component(WatchEvent,                     {data: event})
        default: return [
          m.component(UserName, {data: event}),
          m('span', {class: 'text-muted'}, [
            "('",
            event.type,
            "' Not Implemented)",
          ]),
        ];
      }
    };

    vm.meta = m.prop({});
    vm.rateLimit = function() {
      if ($.isEmptyObject(this.meta())) { return }

      var reset_at = parseInt(this.meta()["X-RateLimit-Reset"] || 0);
      return [
        m('a', {href: 'https://developer.github.com/v3/#rate-limiting'}, "API Rate Limit"),
        ": ",
        this.meta()["X-RateLimit-Remaining"],
        "/",
        this.meta()["X-RateLimit-Limit"],
        " (Reset at: ",
        moment.unix(reset_at).toString(),
        ")",
      ]
    }
  }
};

var EventListComponent = {
  controller: function() {
    vm.init();
    // vm.fetchEvents(); // for dev
  },
  view: function() {
    return [
      m('div', {class: 'jumbotron'}, [
        m('h2', [
          'GitHub',
          m('span', {class: 'mega-octicon octicon-mark-github', style: 'padding: 8px'}),
          'Event Viewer',
        ]),
        m('h3', [
          'github.com/',
          m('input', {
            placeholder: 'owner/repo',
            onchange: m.withAttr('value', vm.text),
            value: vm.text(),
            autofocus: true,
            onkeydown: function(e) {
              if (e.keyCode == 13) {
                vm.fetchEvents();
              } else {
                m.redraw.strategy("none");
              }
            },
          }),
        ]),
        m('p'),
        m('button', {onclick: vm.fetchEvents, class: 'btn btn-lg btn-default'}, 'view'),
      ]),
      m('table', {class: 'table table-condensed'}, [
        m('tbody', [
          vm.events().map(function(event) {
            var created_at = moment(event.created_at)
            return [
              m('tr', [
                m('td', {align: 'center', class: 'onepx'}, m.component(EventIcon, {data: event})),
                m('td', [
                  vm.dispatchEvent(event),
                  ' ',
                  m('span', {class: 'text-muted', title: created_at.toString()},
                    moment(event.created_at).fromNow()
                  ),
                ]),
              ]),
            ]
          }),
        ]),
      ]),
      m('hr'),
      m('p', {class: 'text-muted'}, [
        vm.rateLimit(),
      ]),
      m('p', {align: 'right'}, [
        m('a', {href: 'https://github.com/meganemura/github-event-viewer'}, [
          m('span', {class: 'octicon octicon-repo', style: 'padding: 8px'}),
          'meganemura/github-event-viewer',
        ]),
      ]),
    ];
  },
}

m.mount(document.getElementById('root'), EventListComponent);
