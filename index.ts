import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const cargo = new pulumi.StackReference(config.require("cargo"))
const kubeconfig = cargo.getOutput("kubeconfig");
const appLabels = { app: "nginx" };

const k8sProvider = new k8s.Provider("k8s-provider", {
	kubeconfig: kubeconfig,
});

const namespace = new k8s.core.v1.Namespace("nginx", {
	metadata: { name: "nginx" }
}, { provider: k8sProvider });

const nginxDeployment = new k8s.apps.v1.Deployment("nginx-deployment", {
	metadata: { namespace: namespace.metadata.name },
	spec: {
		selector: { matchLabels: appLabels },
		replicas: 1,
		template: {
			metadata: { labels: appLabels },
			spec: {
				containers: [{
					name: "nginx",
					image: "nginx:1.14-alpine",
					ports: [{
						name: "http",
						containerPort: 80,
					}],
				}],
			},
		},
	},
}, { provider: k8sProvider });

const nginxService = new k8s.core.v1.Service("nginx-service", {
	metadata: {
		namespace: namespace.metadata.name,
		labels: appLabels
	},	
	spec: {
		type: "LoadBalancer",
		ports: [{
			port: 80,
			targetPort: 80,
		}],
		selector: { app: "nginx" },
	},
}, { provider: k8sProvider });

export const url = nginxService.status.loadBalancer.ingress[0].hostname;