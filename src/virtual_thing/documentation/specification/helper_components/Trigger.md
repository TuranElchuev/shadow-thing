# Trigger
- startup triggers are not 'awaited' by the model

- shutdown triggers are awaited - should not run forever. if you need parallel, you can use e.g. "wait" of the trigger, or "wait" of the process depending on your design.