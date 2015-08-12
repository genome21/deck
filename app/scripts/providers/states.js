'use strict';

let angular = require('angular');

// need to require these here so they get put in the cache. Look into a better way
require('../modules/instance/details/aws/instanceDetails.html');
require('../modules/instance/details/gce/instanceDetails.html');

require('../modules/serverGroups/details/aws/serverGroupDetails.html');
require('../modules/serverGroups/details/gce/serverGroupDetails.html');

require('../modules/loadBalancers/details/aws/loadBalancerDetails.html');
require('../modules/loadBalancers/details/gce/loadBalancerDetails.html');

require('../modules/securityGroups/details/aws/securityGroupDetails.html');

require('../modules/applications/applications.html');
require('../../views/404.html');

require('../modules/securityGroups/all.html');
require('../modules/securityGroups/filter/filterNav.html');

require('../modules/cluster/all.html');
require('../modules/loadBalancers/filter/filterNav.html');
require('../modules/clusterFilter/filterNav.html');
require('../../views/infrastructure.html');

require('../modules/fastProperties/applicationProperties.html');
require('../modules/fastProperties/fastPropertyRollouts.html');
require('../modules/config/config.html');

require('../modules/fastProperties/main.html');
require('../modules/fastProperties/properties.html');
require('../modules/insight/insight.html');
require('../modules/loadBalancers/all.html');

require('../modules/tasks/tasks.html');
require('../modules/applications/application.html');
require('../modules/instance/standalone.html');

module.exports = angular.module('spinnaker.states', [
  require('angular-ui-router'),
  require('./statehelper.js'),
  require('../modules/delivery/states.js'),
  require('../modules/serverGroups/details/aws/serverGroup.details.module.js'),
])
  .provider('states', function($stateProvider, $urlRouterProvider, stateHelperProvider, deliveryStates) {
    this.setStates = function() {
      $urlRouterProvider.otherwise('/');
      // Don't crash on trailing slashes
      $urlRouterProvider.when('/{path:.*}/', ['$match', function($match) {
        return '/' + $match.path;
      }]);
      $urlRouterProvider.when('/applications/{application}', '/applications/{application}/clusters');
      $urlRouterProvider.when('/', '/applications');

      // Handle legacy links to old security groups path
      $urlRouterProvider.when(
        '/applications/{application}/connections{path:.*}',
        '/applications/{application}/securityGroups'
      );

      // Handle legacy links to old clusters paths
      $urlRouterProvider.when(
        '/applications/{application}/clusters/{acct}/{q}?reg',
        ['$match', function ($match) {
          return '/applications/' + $match.application + '/clusters?q=cluster:' + $match.q + '&acct=' + $match.acct + '&reg=' + $match.reg;
        }]
      );

      var instanceDetails = {
        name: 'instanceDetails',
        url: '/instanceDetails/:provider/:instanceId',
        views: {
          'detail@home.applications.application.insight': {
            templateProvider: ['$templateCache', '$stateParams', function($templateCache, $stateParams) {
              var provider = $stateParams.provider || 'aws';
              return $templateCache.get('app/scripts/modules/instance/details/' + provider + '/instanceDetails.html'); }],
            controllerProvider: ['$stateParams', function($stateParams) {
              var provider = $stateParams.provider || 'aws';
              return provider + 'InstanceDetailsCtrl';
            }],
            controllerAs: 'ctrl'
          }
        },
        resolve: {
          instance: ['$stateParams', function($stateParams) {
            return {
              instanceId: $stateParams.instanceId
            };
          }]
        },
        data: {
          pageTitleDetails: {
            title: 'Instance Details',
            nameParam: 'instanceId'
          }
        }
      };

      var serverGroupDetails = {
        name: 'serverGroup',
        url: '/serverGroupDetails/:provider/:accountId/:region/:serverGroup',
        views: {
          'detail@home.applications.application.insight': {
            templateProvider: ['$templateCache', '$stateParams', function($templateCache, $stateParams) {
              var provider = $stateParams.provider || 'aws';
              return $templateCache.get('app/scripts/modules/serverGroups/details/' + provider + '/serverGroupDetails.html'); }],
            controllerProvider: ['$stateParams', function($stateParams) {
              var provider = $stateParams.provider || 'aws';
              return provider + 'ServerGroupDetailsCtrl';
            }],
            controllerAs: 'ctrl'
          }
        },
        resolve: {
          serverGroup: ['$stateParams', function($stateParams) {
            return {
              name: $stateParams.serverGroup,
              accountId: $stateParams.accountId,
              region: $stateParams.region
            };
          }]
        },
        data: {
          pageTitleDetails: {
            title: 'Server Group Details',
            nameParam: 'serverGroup',
            accountParam: 'accountId',
            regionParam: 'region'
          }
        }
      };

      var loadBalancerDetails = {
        name: 'loadBalancerDetails',
        url: '/loadBalancerDetails/:provider/:accountId/:region/:vpcId/:name',
        params: {
          vpcId: {
            value: null,
            squash: true,
          },
        },
        views: {
          'detail@home.applications.application.insight': {
            templateProvider: ['$templateCache', '$stateParams', function($templateCache, $stateParams) {
              var provider = $stateParams.provider || 'aws';
              return $templateCache.get('app/scripts/modules/loadBalancers/details/' + provider + '/loadBalancerDetails.html'); }],
            controllerProvider: ['$stateParams', function($stateParams) {
              var provider = $stateParams.provider || 'aws';
              return provider + 'LoadBalancerDetailsCtrl';
            }],
            controllerAs: 'ctrl'
          }
        },
        resolve: {
          loadBalancer: ['$stateParams', function($stateParams) {
            return {
              name: $stateParams.name,
              accountId: $stateParams.accountId,
              region: $stateParams.region,
              vpcId: $stateParams.vpcId
            };
          }]
        },
        data: {
          pageTitleDetails: {
            title: 'Load Balancer Details',
            nameParam: 'name',
            accountParam: 'accountId',
            regionParam: 'region'
          }
        }
      };

      var securityGroupDetails = {
        name: 'securityGroupDetails',
        url: '/securityGroupDetails/:provider/:accountId/:region/:vpcId/:name',
        params: {
          vpcId: {
            value: null,
            squash: true,
          },
        },
        views: {
          'detail@home.applications.application.insight': {
            templateProvider: ['$templateCache', '$stateParams', function($templateCache, $stateParams) {
              var provider = $stateParams.provider || 'aws';
              return $templateCache.get('app/scripts/modules/securityGroups/details/' + provider + '/securityGroupDetails.html'); }],
            controllerProvider: ['$stateParams', function($stateParams) {
              var provider = $stateParams.provider || 'aws';
              return provider + 'SecurityGroupDetailsCtrl';
            }],
            controllerAs: 'ctrl'
          }
        },
        resolve: {
          resolvedSecurityGroup: ['$stateParams', function($stateParams) {
            return {
              name: $stateParams.name,
              accountId: $stateParams.accountId,
              region: $stateParams.region,
              vpcId: $stateParams.vpcId,
            };
          }]
        },
        data: {
          pageTitleDetails: {
            title: 'Security Group Details',
            nameParam: 'name',
            accountParam: 'accountId',
            regionParam: 'region'
          }
        }
      };

      var notFound = {
        name: '404',
        url: '/404',
        views: {
          'main@': {
            templateUrl: require('../../views/404.html'),
            controller: angular.noop,
          }
        }
      };

      var taskDetails = {
        name: 'taskDetails',
        url: '/:taskId',
        views: {},
        data: {
          pageTitleDetails: {
            title: 'Task Details',
            nameParam: 'taskId'
          }
        }
      };

      var insight = {
        name: 'insight',
        abstract: true,
        views: {
          'insight': {
            templateUrl: require('../modules/insight/insight.html'),
            controller: 'InsightCtrl',
            controllerAs: 'insight'
          }
        },
        children: [
          {
          name: 'clusters',
          url: '/clusters',
          views: {
            'nav': {
              templateUrl: require('../modules/clusterFilter/filterNav.html'),
              controller: 'ClusterFilterCtr',
              controllerAs: 'clustersFilters'
            },
            'master': {
              templateUrl: require('../modules/cluster/all.html'),
              controller: 'AllClustersCtrl',
              controllerAs: 'allClusters'
            }
          },
          data: {
            pageTitleSection: {
              title: 'Clusters'
            }
          },
          children: [
            loadBalancerDetails,
            serverGroupDetails,
            instanceDetails,
            securityGroupDetails,
          ],
        },
        {
          url: '/loadBalancers',
          name: 'loadBalancers',
          views: {
            'nav': {
              templateUrl: require('../modules/loadBalancers/filter/filterNav.html'),
              controller: 'LoadBalancerFilterCtrl',
              controllerAs: 'loadBalancerFilters'
            },
            'master': {
              templateUrl: require('../modules/loadBalancers/all.html'),
              controller: 'AllLoadBalancersCtrl',
              controllerAs: 'ctrl'
            }
          },
          data: {
            pageTitleSection: {
              title: 'Load Balancers'
            }
          },
          children: [
            loadBalancerDetails,
            serverGroupDetails,
            instanceDetails,
            securityGroupDetails,
          ],
        },
        {
          url: '/securityGroups',
          name: 'securityGroups',
          views: {
            'nav': {
              templateUrl: require('../modules/securityGroups/filter/filterNav.html'),
              controller: 'SecurityGroupFilterCtrl',
              controllerAs: 'securityGroupFilters'
            },
            'master': {
              templateUrl: require('../modules/securityGroups/all.html'),
              controller: 'AllSecurityGroupsCtrl',
              controllerAs: 'ctrl'
            }
          },
          data: {
            pageTitleSection: {
              title: 'Security Groups'
            }
          },
          children: [
            loadBalancerDetails,
            serverGroupDetails,
            securityGroupDetails,
          ]
        }
        ]
      };

      var tasks = {
        name: 'tasks',
        url: '/tasks',
        views: {
          'insight': {
            templateUrl: require('../modules/tasks/tasks.html'),
            controller: 'TasksCtrl',
            controllerAs: 'tasks'
          },
        },
        data: {
          pageTitleSection: {
            title: 'Tasks'
          }
        },
        children: [taskDetails],
      };

      var config = {
        name: 'config',
        url: '/config',
        views: {
          'insight': {
            templateUrl: require('../modules/config/config.html'),
            controller: 'ConfigController',
            controllerAs: 'config'
          },
        },
        data: {
          pageTitleSection: {
            title: 'Config'
          }
        }
      };

      var fastPropertyRollouts = {
        name: 'rollouts',
        url: '/rollouts',
        views: {
          'master': {
            templateUrl: require('../modules/fastProperties/fastPropertyRollouts.html'),
            controller: 'FastPropertyRolloutController',
            controllerAs: 'rollout'
          }
        },
        data: {
          pageTitleSection: {
            title: 'Fast Property Rollout'
          }
        }
      };

      var appFastProperties = {
        name: 'properties',
        url: '/properties',
        views: {
          'insight': {
            templateUrl: require('../modules/fastProperties/applicationProperties.html'),
            controller: 'ApplicationPropertiesController',
            controllerAs: 'fp'
          }
        },
        data: {
          pageTitleSection: {
            title: 'Fast Properties'
          }
        }
      };


      var application = {
        name: 'application',
        url: '/:application',
        views: {
          'main@': {
            templateUrl: require('../modules/applications/application.html'),
            controller: 'ApplicationCtrl',
            controllerAs: 'ctrl'
          },
        },
        resolve: {
          app: ['$stateParams', 'applicationReader', function($stateParams, applicationReader) {
            return applicationReader.getApplication($stateParams.application, {tasks: true, executions: true})
              .then(
                function(app) {
                  return app;
                },
                function() { return {notFound: true, name: $stateParams.application}; }
              );
          }]
        },
        data: {
          pageTitleMain: {
            field: 'application'
          }
        },
        children: [
          insight,
          tasks,
          deliveryStates.executions,
          deliveryStates.configure,
          config,
          appFastProperties,
        ],
      };

      var applications = {
        name: 'applications',
        url: '/applications',
        views: {
          'main@': {
            templateUrl: require('../modules/applications/applications.html'),
            controller: 'ApplicationsCtrl',
            controllerAs: 'ctrl'
          }
        },
        data: {
          pageTitleMain: {
            label: 'Applications'
          }
        },
        children: [
          application
        ],
      };

      var fastProperties = {
        name: 'properties',
        url: '/properties',
        reloadOnSearch: false,
        views: {
          'master': {
            templateUrl: require('../modules/fastProperties/properties.html'),
            controller: 'FastPropertiesController',
            controllerAs: 'fp'
          }
        }
      };

      var data = {
        name: 'data',
        url: '/data',
        reloadOnSearch: false,
        views: {
          'main@': {
            templateUrl: require('../modules/fastProperties/main.html'),
            controller: 'FastPropertyDataController',
            controllerAs: 'data'
          }
        },
        data: {
          pageTitleMain: {
            label: 'Data'
          }
        },
        children: [
          fastProperties,
          fastPropertyRollouts,
        ]
      };


      var infrastructure = {
        name: 'infrastructure',
        url: '/infrastructure?q',
        reloadOnSearch: false,
        views: {
          'main@': {
            templateUrl: require('../../views/infrastructure.html'),
            controller: 'InfrastructureCtrl',
            controllerAs: 'ctrl'
          }
        },
        data: {
          pageTitleMain: {
            label: 'Infrastructure'
          }
        }
      };

      var standaloneInstance = {
        name: 'standaloneInstance',
        url: '/instance/:provider/:account/:region/:instanceId',
        views: {
          'main@': {
            templateUrl: require('../modules/instance/standalone.html'),
            controllerProvider: ['$stateParams', function($stateParams) {
              var provider = $stateParams.provider || 'aws';
              return provider + 'InstanceDetailsCtrl';
            }],
            controllerAs: 'ctrl'
          }
        },
        resolve: {
          instance: ['$stateParams', function($stateParams) {
            return {
              instanceId: $stateParams.instanceId,
              account: $stateParams.account,
              region: $stateParams.region,
              noApplication: true
            };
          }],
          application: function() {
            return {
              name: '(standalone instance)',
              registerAutoRefreshHandler: angular.noop,
              isStandalone: true,
            };
          }
        },
        data: {
          pageTitleDetails: {
            title: 'Instance Details',
            nameParam: 'instanceId'
          }
        }
      };

      var home = {
        name: 'home',
        abstract: true,
        children: [
          notFound,
          applications,
          infrastructure,
          data,
          standaloneInstance
        ],
      };

      stateHelperProvider.setNestedState(home);

    };

    this.$get = angular.noop;

  })
  .name;
