var ghUrl = "https://github.com/"
var ghApiEndpoint = "https://api.github.com/"

var GitHubEvent = function(data) {
  this.data = data;

  this.event = function() {
    switch (this.data.type) {
      case 'ForkEvent':         return [this.login(), "forked"]
      case 'GollumEvent':       return this.gollumEvent()
      case 'IssueCommentEvent': return this.issueCommentEvent()
      case 'IssuesEvent':       return this.issuesEvent()
      case 'WatchEvent':        return [this.login(), "started watching"]
      default: return [
        this.login(),
        m('span', {class: 'text-muted'}, [
          "('",
          this.data.type,
          "' Not Implemented)",
        ]),
      ];
    }
  };

  this.gollumEvent = function() {
    return [
      this.login(),
      this.data.payload.pages.map(function(page) {
        return [
          page.action,
          ' ',
          m('a', {href: ghUrl + page.html_url}, page.title),
        ];
      }),
    ];
  };

  this.issueCommentEvent = function() {
    return [
      this.login(),
      ' commented on issue ',
      m('a', {href: this.data.payload.comment.html_url}, [
        '#',
        this.data.payload.issue.number,
      ]),
    ];
  };

  this.issuesEvent = function() {
    return [
      this.login(),
      ' ',
      this.data.payload.action,
      ' issue ',
      m('a', {href: this.data.payload.issue.html_url}, [
        '#',
        this.data.payload.issue.number,
      ]),
    ];
  };

  // icon and name with link
  this.login = function() {
    return m('a', {href: ghUrl + this.data.actor.login}, [
      m('img', {src: data.actor.avatar_url, width: 20, class: 'img-rounded', hspace: 6}),
      data.actor.login,
      ' ',
    ]);
  };

  this.icon = function() {
    return m('span', {
      class: 'octicon ' + this.octiconClass(),
      title: this.data.type,
      'text-align': 'center',
    });
  };

  // returns octicon style class
  this.octiconClass = function() {
    switch (this.data.type) {
      case 'CreateEvent':       return 'octicon-git-pull-request';
      case 'DeleteEvent':       return 'octicon-trashcan';
      case 'PullRequestEvent':  return 'octicon-git-pull-request';
      case 'PushEvent':         return 'octicon-repo-push';
      case 'WatchEvent':        return 'octicon-eye';
      case 'ForkEvent':         return 'octicon-repo-forked';
      case 'IssueCommentEvent': return 'octicon-comment-discussion';
      case 'GollumEvent':       return 'octicon-book';
      case 'IssuesEvent':       return 'octicon-issue-opened';  // TODO: open/close
      default: return 'octicon-question';
    }
  };
};
GitHubEvent.repositoryEvents = function(owner_and_repo) {
  return m.request({dataType: "jsonp", url: ghApiEndpoint + "repos/" + owner_and_repo + "/events"});
};

var vm = {
  init: function() {
    vm.text = m.prop('lhorie/mithril.js');
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

function controller() {
  vm.init();
  // vm.fetchEvents(); // for dev
}

function view() {
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
        vm.events().map(function(data) {
          var e = new GitHubEvent(data);
          var created_at = moment(data.created_at)
          return [
            m('tr', [
              m('td', {align: 'center', class: 'onepx'}, e.icon()),
              m('td', [
                e.event(),
                ' ',
                m('span', {class: 'text-muted', title: created_at.toString()},
                  moment(data.created_at).fromNow()
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
}

var component = {
  controller: controller,
  view: view
}

m.mount(document.getElementById('root'), component);
