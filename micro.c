#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>
#include <string.h>

void err(char *str)
{
	while (*str)
		write(2, str++, 1);
}

int cd(char **argv, int i)
{
	if (i != 2)
		return (err("error: cd: bad arguments\n"), 1);
	if (chdir(argv[1]) == -1)
		return (err("error: cd: cannot change directory to "), err(argv[1]), err("\n"), 1);
	return (0);
}

void set_pipe(int has_pipe, int *fd, int end)
{
	if (has_pipe && (dup2(fd[end], end) == -1 || close(fd[0] == -1) || close(fd[1]) == -1))
		err("error: fatal\n"), exit(1);
}

int exec(char **argv, int i, char **envp)
{
	int has_pipe, fd[2], pid, status;
	has_pipe = argv[i] && !strcmp(argv[i], "|");

	printf("2-1\n");
	if (!has_pipe && !strcmp(*argv, "cd"))
		return (cd(argv, i));
	printf("2-2\n");
	if (has_pipe && pipe(fd) == -1)
		err("error: fatal\n"), exit(1);
	printf("2-3\n");
	if (has_pipe && (pid = fork()) == -1)
		err("error: fatal\n"), exit(1);
	printf("2-4\n");
	if (!pid )
	{
		argv[i] = 0;
		set_pipe(has_pipe, fd, 1);
		if (!strcmp(argv[i], "cd"))
			return (cd(argv, i));
		execve(*argv, argv, envp);
		err("error: cannot execute "), err(*argv), err("\n"), exit(1);
	}
	waitpid(pid, &status, 1);
	set_pipe(has_pipe, fd, 0);
	return (WIFEXITED(status) && WEXITSTATUS(status));
}

int main(int argc, char **argv, char **envp)
{
	int i = 0, status = 0;

	(void) argc;
	while (argv[i])
	{
		argv += i + 1;
		i = 0;
		printf("1\n");
		while (argv[i] && strcmp(argv[i], "|") && strcmp(argv[i], ";"))
			i++;
		printf("2\n");
		if (i)
			status = exec(argv, i, envp);
		printf("3\n");
	}
	return (status);
}