# KubeCon Challenge

A small Pulumi TypeScript program that deploys nginx to an existing Kubernetes cluster. In this challenge, you use Pulumi Neo (Pulumi's AI agent) to change the infrastructure code and open a pull request.

## KubeCon challenge steps

1. Fork [pulumi-demos/kubecon-challenge](https://github.com/pulumi-demos/kubecon-challenge) into your own GitHub org.
2. Sign up for a [Pulumi trial](https://app.pulumi.com/signup).
3. In Pulumi's main nav, go to **Settings > Version control** and select **Add account**.
4. Select the **GitHub** radio button, scroll to the bottom of the page, and select **Authorize in GitHub**.
5. Select the GitHub org you forked the repo into, then select either **All repositories** or **Only select repositories** (if you choose the latter, include your fork).
6. Go back to the main nav menu and select **Agents**.
7. In the prompt area, click the **+** (**Add context**) button.
8. Select **</> Repository** from the dropdown and choose your fork.
9. In the prompt area, enter:

   ```
   increase frontend deployment replicas to 3
   ```

10. Review the proposed changes, and select **Yes** when prompted to run a preview.
11. The preview will not run, because your org can't access the stack this repo uses. Neo reports something like:

    > Preview can't run: stack demo/kubecon-challenge/dev isn't accessible from this org (tsc passes). Open a PR with the replicas change anyway?

    Select **Yes**. Neo creates a feature branch and opens a pull request in your fork.
12. Push the feature branch to the upstream parent repo from step 1 by opening a pull request from your fork to `pulumi-demos/kubecon-challenge`.

## What's in this repo

| File | Purpose |
| --- | --- |
| `index.ts` | The Pulumi program: an `nginx` namespace, Deployment, and `LoadBalancer` Service |
| `Pulumi.yaml` | Project definition (Node.js runtime, npm) |
| `Pulumi.dev.yaml` | Config for the `dev` stack |
| `.mcp.json` | Pulumi MCP server config for AI coding assistants |

The program doesn't create a cluster. It reads a `kubeconfig` output from another Pulumi stack, named by the `cargo` config key (`demo/cargo/lotctl` in `Pulumi.dev.yaml`), and uses it for an explicit Kubernetes provider.

## Running it yourself

If you have your own cluster stack that exports a `kubeconfig` output:

```bash
npm install
pulumi stack init dev
pulumi config set cargo <org>/<project>/<stack>   # stack that exports kubeconfig
npx tsc --noEmit                                  # type-check
pulumi preview
pulumi up
pulumi stack output url                           # LoadBalancer hostname
```

The `url` output reads `status.loadBalancer.ingress[0].hostname`, so it expects a cloud load balancer that reports a hostname (for example, AWS ELB). On clusters that report an IP address instead, `url` will be empty.
